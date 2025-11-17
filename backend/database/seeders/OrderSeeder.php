<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $acheteurs = User::where('role', 'acheteur')->get();
        $products = Product::with('agriculteur')->where('status', 'active')->get();

        if ($acheteurs->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No buyers or products found. Run UserSeeder and ProductSeeder first.');
            return;
        }

        $statuses = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled'];
        $deliveryTypes = ['pickup', 'home_delivery', 'relay_point', 'shipping'];
        $paymentMethods = ['card', 'flouci', 'd17', 'bank_transfer', 'cod'];

        $orders = [
            // Order 1 - Delivered
            [
                'acheteur' => $acheteurs[0] ?? null,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'delivery_type' => 'home_delivery',
                'payment_method' => 'card',
                'created_days_ago' => 15,
                'items' => [
                    ['product' => $products[0] ?? null, 'quantity' => 3],
                    ['product' => $products[1] ?? null, 'quantity' => 2],
                ],
            ],
            // Order 2 - In Delivery
            [
                'acheteur' => $acheteurs[1] ?? null,
                'status' => 'in_delivery',
                'payment_status' => 'paid',
                'delivery_type' => 'home_delivery',
                'payment_method' => 'flouci',
                'created_days_ago' => 2,
                'items' => [
                    ['product' => $products[5] ?? null, 'quantity' => 2],
                ],
            ],
            // Order 3 - Confirmed
            [
                'acheteur' => $acheteurs[2] ?? null,
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'delivery_type' => 'pickup',
                'payment_method' => 'card',
                'created_days_ago' => 1,
                'items' => [
                    ['product' => $products[3] ?? null, 'quantity' => 5],
                    ['product' => $products[4] ?? null, 'quantity' => 3],
                ],
            ],
            // Order 4 - Pending
            [
                'acheteur' => $acheteurs[0] ?? null,
                'status' => 'pending',
                'payment_status' => 'pending',
                'delivery_type' => 'relay_point',
                'payment_method' => 'cod',
                'created_days_ago' => 0,
                'items' => [
                    ['product' => $products[2] ?? null, 'quantity' => 1],
                ],
            ],
            // Order 5 - Delivered (Large Order)
            [
                'acheteur' => $acheteurs[1] ?? null,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'delivery_type' => 'shipping',
                'payment_method' => 'bank_transfer',
                'created_days_ago' => 20,
                'items' => [
                    ['product' => $products[5] ?? null, 'quantity' => 5],
                    ['product' => $products[6] ?? null, 'quantity' => 3],
                    ['product' => $products[7] ?? null, 'quantity' => 10],
                ],
            ],
            // Order 6 - Preparing
            [
                'acheteur' => $acheteurs[2] ?? null,
                'status' => 'preparing',
                'payment_status' => 'paid',
                'delivery_type' => 'home_delivery',
                'payment_method' => 'd17',
                'created_days_ago' => 3,
                'items' => [
                    ['product' => $products[8] ?? null, 'quantity' => 2],
                    ['product' => $products[9] ?? null, 'quantity' => 1],
                ],
            ],
            // Order 7 - Cancelled
            [
                'acheteur' => $acheteurs[0] ?? null,
                'status' => 'cancelled',
                'payment_status' => 'refunded',
                'delivery_type' => 'home_delivery',
                'payment_method' => 'card',
                'created_days_ago' => 7,
                'items' => [
                    ['product' => $products[1] ?? null, 'quantity' => 4],
                ],
            ],
            // Order 8 - Delivered
            [
                'acheteur' => $acheteurs[1] ?? null,
                'status' => 'delivered',
                'payment_status' => 'paid',
                'delivery_type' => 'pickup',
                'payment_method' => 'card',
                'created_days_ago' => 25,
                'items' => [
                    ['product' => $products[10] ?? null, 'quantity' => 0.5],
                ],
            ],
        ];

        foreach ($orders as $orderData) {
            if (!$orderData['acheteur'] || empty($orderData['items'])) {
                continue;
            }

            // Calculate order totals
            $subtotal = 0;
            $itemsData = [];

            foreach ($orderData['items'] as $itemData) {
                if (!$itemData['product']) continue;

                $product = $itemData['product'];
                $quantity = $itemData['quantity'];
                $itemTotal = $product->price_per_unit * $quantity;
                $subtotal += $itemTotal;

                $itemsData[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'unit_price' => $product->price_per_unit,
                    'total_price' => $itemTotal,
                ];
            }

            if (empty($itemsData)) continue;

            // Get agriculteur from first product
            $agriculteurId = $itemsData[0]['product']->agriculteur->user_id;

            // Calculate fees
            $commission = $this->calculateCommission($subtotal);
            $deliveryFee = $this->calculateDeliveryFee($orderData['delivery_type'], $subtotal);
            $totalAmount = $subtotal + $deliveryFee;

            // Create delivery address if needed
            $deliveryAddress = null;
            if (in_array($orderData['delivery_type'], ['home_delivery', 'shipping'])) {
                $deliveryAddress = [
                    'street' => '123 Avenue Habib Bourguiba',
                    'city' => 'Tunis',
                    'governorate' => 'Tunis',
                    'postal_code' => '1000',
                ];
            }

            // Build status history
            $statusHistory = $this->buildStatusHistory($orderData['status'], $orderData['created_days_ago']);

            // Create order
            $order = Order::create([
                'order_number' => 'AGR-' . strtoupper(Str::random(10)),
                'buyer_id' => $orderData['acheteur']->id,
                'agriculteur_id' => $agriculteurId,
                'status' => $orderData['status'],
                'payment_status' => $orderData['payment_status'],
                'delivery_type' => $orderData['delivery_type'],
                'delivery_address' => $deliveryAddress,
                'delivery_date' => now()->addDays(rand(1, 7)),
                'subtotal' => $subtotal,
                'commission' => $commission,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'payment_method' => $orderData['payment_method'],
                'paid_at' => $orderData['payment_status'] === 'paid' ? now()->subDays($orderData['created_days_ago']) : null,
                'status_history' => $statusHistory,
                'created_at' => now()->subDays($orderData['created_days_ago']),
                'updated_at' => now()->subDays(max(0, $orderData['created_days_ago'] - 1)),
            ]);

            // Create order items
            foreach ($itemsData as $itemData) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $itemData['product']->id,
                    'product_name' => $itemData['product']->name_fr,
                    'quantity' => $itemData['quantity'],
                    'unit' => $itemData['product']->unit,
                    'unit_price' => $itemData['unit_price'],
                    'total_price' => $itemData['total_price'],
                ]);
            }

            // Update acheteur stats
            if ($orderData['status'] === 'delivered') {
                $acheteur = $orderData['acheteur']->acheteur;
                if ($acheteur) {
                    $acheteur->increment('total_orders');
                    $acheteur->increment('total_spent', $totalAmount);
                    $acheteur->increment('loyalty_points', (int)($totalAmount * 2));
                }
            }
        }

        $this->command->info('Orders seeded successfully!');
    }

    private function calculateCommission(float $amount): float
    {
        if ($amount < 50) return $amount * 0.12;
        if ($amount > 200) return $amount * 0.08;
        return $amount * 0.10;
    }

    private function calculateDeliveryFee(string $type, float $amount): float
    {
        return match($type) {
            'pickup' => 0,
            'relay_point' => 3,
            'home_delivery' => $amount > 50 ? 5 : 10,
            'shipping' => 15,
            default => 0,
        };
    }

    private function buildStatusHistory(string $finalStatus, int $daysAgo): array
    {
        $statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered'];
        $history = [];

        $currentIndex = array_search($finalStatus, $statusFlow);
        if ($currentIndex === false) {
            // Cancelled order
            $history[] = [
                'status' => 'pending',
                'timestamp' => now()->subDays($daysAgo)->toIso8601String(),
            ];
            $history[] = [
                'status' => 'cancelled',
                'timestamp' => now()->subDays(max(0, $daysAgo - 1))->toIso8601String(),
                'note' => 'Annulé par le client',
            ];
            return $history;
        }

        // Build history up to current status
        for ($i = 0; $i <= $currentIndex; $i++) {
            $daysOffset = $daysAgo - ($currentIndex - $i);
            $history[] = [
                'status' => $statusFlow[$i],
                'timestamp' => now()->subDays(max(0, $daysOffset))->toIso8601String(),
            ];
        }

        return $history;
    }
}
