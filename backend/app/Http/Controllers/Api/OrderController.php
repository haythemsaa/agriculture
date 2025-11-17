<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Get user orders
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Order::with(['items.product', 'buyer', 'agriculteur']);

        if ($user->isAgriculteur()) {
            $query->where('agriculteur_id', $user->id);
        } else {
            $query->where('buyer_id', $user->id);
        }

        // Status filter
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($orders);
    }

    /**
     * Get single order
     */
    public function show(Request $request, $id)
    {
        $order = Order::with(['items.product', 'buyer', 'agriculteur', 'reviews'])
            ->findOrFail($id);

        // Authorization
        $user = $request->user();
        if ($order->buyer_id !== $user->id && $order->agriculteur_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['order' => $order]);
    }

    /**
     * Create order
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAcheteur()) {
            return response()->json(['error' => 'Only buyers can create orders'], 403);
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0',
            'delivery_type' => 'required|in:pickup,home_delivery,relay_point,shipping',
            'delivery_address' => 'required_if:delivery_type,home_delivery,shipping',
            'delivery_date' => 'nullable|date|after:today',
            'payment_method' => 'required|in:card,flouci,d17,bank_transfer,cod',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            // Validate all products are from same agriculteur
            $productIds = collect($request->items)->pluck('product_id');
            $products = Product::whereIn('id', $productIds)->get();

            $agriculteurIds = $products->pluck('agriculteur_id')->unique();
            if ($agriculteurIds->count() > 1) {
                return response()->json(['error' => 'All products must be from same agriculteur'], 422);
            }

            $agriculteurId = $agriculteurIds->first();
            $subtotal = 0;
            $orderItems = [];

            // Calculate totals and validate stock
            foreach ($request->items as $item) {
                $product = $products->firstWhere('id', $item['product_id']);

                if (!$product || !$product->isAvailable()) {
                    return response()->json(['error' => "Product {$product->name_fr} is not available"], 422);
                }

                if ($product->stock_available < $item['quantity']) {
                    return response()->json(['error' => "Insufficient stock for {$product->name_fr}"], 422);
                }

                $itemTotal = $product->price_per_unit * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name_fr,
                    'quantity' => $item['quantity'],
                    'unit' => $product->unit,
                    'unit_price' => $product->price_per_unit,
                    'total_price' => $itemTotal,
                ];
            }

            // Calculate commission
            $commissionRate = $this->calculateCommissionRate($subtotal);
            $commission = $subtotal * $commissionRate;

            // Calculate delivery fee
            $deliveryFee = $this->calculateDeliveryFee($request->delivery_type, $subtotal);

            $totalAmount = $subtotal + $deliveryFee;

            // Create order
            $order = Order::create([
                'order_number' => 'AGR-' . strtoupper(Str::random(10)),
                'buyer_id' => $request->user()->id,
                'agriculteur_id' => $agriculteurId,
                'status' => 'pending',
                'payment_status' => 'pending',
                'delivery_type' => $request->delivery_type,
                'delivery_address' => $request->delivery_address,
                'delivery_date' => $request->delivery_date,
                'delivery_notes' => $request->delivery_notes,
                'subtotal' => $subtotal,
                'commission' => $commission,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'payment_method' => $request->payment_method,
                'status_history' => [[
                    'status' => 'pending',
                    'timestamp' => now()->toIso8601String(),
                ]]
            ]);

            // Create order items
            foreach ($orderItems as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    ...$itemData
                ]);

                // Update product stock
                Product::find($itemData['product_id'])->decrement('stock_available', $itemData['quantity']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Order created successfully',
                'order' => $order->load(['items.product', 'buyer', 'agriculteur']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Order creation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Authorization
        $user = $request->user();
        if ($order->agriculteur_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:confirmed,preparing,ready,in_delivery,delivered,cancelled',
            'note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $order->updateStatus($request->status, $request->note);

        if ($request->status === 'delivered') {
            $order->update(['payment_status' => 'paid', 'paid_at' => now()]);
        }

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order->load(['items.product', 'buyer', 'agriculteur']),
        ]);
    }

    /**
     * Cancel order
     */
    public function cancel(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // Authorization
        $user = $request->user();
        if ($order->buyer_id !== $user->id && $order->agriculteur_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if (!$order->canBeCancelled()) {
            return response()->json(['error' => 'Order cannot be cancelled'], 422);
        }

        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $request->reason,
            'cancelled_at' => now(),
        ]);

        // Restore stock
        foreach ($order->items as $item) {
            Product::find($item->product_id)->increment('stock_available', $item->quantity);
        }

        return response()->json(['message' => 'Order cancelled successfully']);
    }

    /**
     * Calculate commission rate based on order amount
     */
    private function calculateCommissionRate(float $amount): float
    {
        if ($amount < 50) {
            return 0.12; // 12%
        } elseif ($amount > 200) {
            return 0.08; // 8%
        }
        return 0.10; // 10%
    }

    /**
     * Calculate delivery fee
     */
    private function calculateDeliveryFee(string $deliveryType, float $subtotal): float
    {
        return match($deliveryType) {
            'pickup' => 0,
            'relay_point' => 3,
            'home_delivery' => $subtotal > 50 ? 5 : 10,
            'shipping' => 15,
            default => 0,
        };
    }
}
