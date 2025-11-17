<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    /**
     * Get all products with filters
     */
    public function index(Request $request)
    {
        $query = Product::with(['agriculteur.user', 'category'])
            ->active()
            ->inStock();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_fr', 'ILIKE', "%{$search}%")
                  ->orWhere('name_ar', 'ILIKE', "%{$search}%")
                  ->orWhere('name_en', 'ILIKE', "%{$search}%")
                  ->orWhere('description_fr', 'ILIKE', "%{$search}%");
            });
        }

        // Category filter
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Governorate filter
        if ($request->has('governorate')) {
            $query->whereHas('agriculteur', function ($q) use ($request) {
                $q->where('governorate', $request->governorate);
            });
        }

        // Price range filter
        if ($request->has('min_price')) {
            $query->where('price_per_unit', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price_per_unit', '<=', $request->max_price);
        }

        // Organic filter
        if ($request->has('is_organic') && $request->is_organic) {
            $query->organic();
        }

        // Certification filter
        if ($request->has('certification')) {
            $query->whereJsonContains('certifications', $request->certification);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if ($sortBy === 'price') {
            $query->orderBy('price_per_unit', $sortOrder);
        } elseif ($sortBy === 'rating') {
            $query->orderBy('rating_average', $sortOrder);
        } elseif ($sortBy === 'popularity') {
            $query->orderBy('sales_count', $sortOrder);
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        $products = $query->paginate($request->get('per_page', 20));

        return response()->json($products);
    }

    /**
     * Get single product
     */
    public function show($id)
    {
        $product = Product::with([
            'agriculteur.user',
            'category',
            'reviews.reviewer'
        ])->findOrFail($id);

        // Increment views
        $product->incrementViews();

        return response()->json(['product' => $product]);
    }

    /**
     * Create product (agriculteur only)
     */
    public function store(Request $request)
    {
        if (!$request->user()->isAgriculteur()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name_ar' => 'required|string|max:255',
            'name_fr' => 'required|string|max:255',
            'name_en' => 'nullable|string|max:255',
            'description_fr' => 'required|string',
            'images' => 'required|array|min:1',
            'price_per_unit' => 'required|numeric|min:0',
            'unit' => 'required|in:kg,g,l,ml,piece,bunch,box,bag',
            'stock_available' => 'required|numeric|min:0',
            'minimum_order' => 'nullable|numeric|min:0',
            'harvest_date' => 'nullable|date',
            'is_organic' => 'boolean',
            'certifications' => 'nullable|array',
            'tags' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product = Product::create([
            'agriculteur_id' => $request->user()->agriculteur->id,
            'category_id' => $request->category_id,
            'name_ar' => $request->name_ar,
            'name_fr' => $request->name_fr,
            'name_en' => $request->name_en ?? $request->name_fr,
            'description_ar' => $request->description_ar,
            'description_fr' => $request->description_fr,
            'description_en' => $request->description_en,
            'images' => $request->images,
            'price_per_unit' => $request->price_per_unit,
            'unit' => $request->unit,
            'minimum_order' => $request->minimum_order ?? 1,
            'stock_available' => $request->stock_available,
            'harvest_date' => $request->harvest_date,
            'is_organic' => $request->is_organic ?? false,
            'certifications' => $request->certifications,
            'origin' => $request->user()->agriculteur->governorate,
            'tags' => $request->tags,
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'product' => $product->load(['agriculteur.user', 'category']),
        ], 201);
    }

    /**
     * Update product
     */
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Authorization
        if ($product->agriculteur->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|exists:categories,id',
            'name_fr' => 'sometimes|string|max:255',
            'price_per_unit' => 'sometimes|numeric|min:0',
            'stock_available' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:active,inactive,out_of_stock',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $product->update($request->all());

        return response()->json([
            'message' => 'Product updated successfully',
            'product' => $product->load(['agriculteur.user', 'category']),
        ]);
    }

    /**
     * Delete product
     */
    public function destroy(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Authorization
        if ($product->agriculteur->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }

    /**
     * Get similar products
     */
    public function similar($id)
    {
        $product = Product::findOrFail($id);

        $similar = Product::with(['agriculteur.user', 'category'])
            ->active()
            ->inStock()
            ->where('id', '!=', $id)
            ->where('category_id', $product->category_id)
            ->orderBy('rating_average', 'desc')
            ->limit(6)
            ->get();

        return response()->json(['products' => $similar]);
    }
}
