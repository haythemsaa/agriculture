<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    /**
     * Get user's favorite products.
     */
    public function index(Request $request): JsonResponse
    {
        $favorites = $request->user()->favoriteProducts()
            ->with(['agriculteur.user', 'category'])
            ->where('status', 'active')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'favorites' => $favorites,
        ]);
    }

    /**
     * Add a product to favorites.
     */
    public function store(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        // Check if already favorited
        $exists = Favorite::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Ce produit est déjà dans vos favoris',
            ], 400);
        }

        // Add to favorites
        Favorite::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Produit ajouté aux favoris',
        ]);
    }

    /**
     * Remove a product from favorites.
     */
    public function destroy(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $deleted = Favorite::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Ce produit n\'est pas dans vos favoris',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produit retiré des favoris',
        ]);
    }

    /**
     * Toggle favorite status for a product.
     */
    public function toggle(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $favorite = Favorite::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            $isFavorited = false;
            $message = 'Produit retiré des favoris';
        } else {
            Favorite::create([
                'user_id' => $user->id,
                'product_id' => $product->id,
            ]);
            $isFavorited = true;
            $message = 'Produit ajouté aux favoris';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'is_favorited' => $isFavorited,
        ]);
    }

    /**
     * Check if product is favorited by user.
     */
    public function check(Request $request, Product $product): JsonResponse
    {
        $user = $request->user();

        $isFavorited = Favorite::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json([
            'success' => true,
            'is_favorited' => $isFavorited,
        ]);
    }
}
