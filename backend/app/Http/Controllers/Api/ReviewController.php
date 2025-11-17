<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Review;
use App\Models\Product;
use App\Models\Agriculteur;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Add a review for an order.
     */
    public function addOrderReview(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'string',
        ]);

        $user = $request->user();

        // Check if user is the buyer of this order
        if ($order->buyer_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez évaluer que vos propres commandes',
            ], 403);
        }

        // Check if order is delivered
        if ($order->status !== 'delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez évaluer que les commandes livrées',
            ], 400);
        }

        // Check if review already exists
        if ($order->reviews()->where('reviewer_id', $user->id)->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà évalué cette commande',
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Create review for the agriculteur
            $review = Review::create([
                'order_id' => $order->id,
                'reviewer_id' => $user->id,
                'reviewee_id' => $order->agriculteur_id,
                'product_id' => $order->items->first()?->product_id,
                'rating' => $request->rating,
                'comment' => $request->comment,
                'images' => $request->images ?? [],
                'is_verified_purchase' => true,
                'is_approved' => true, // Auto-approve for now
            ]);

            // Update agriculteur rating
            $this->updateAgriculteurRating($order->agriculteur_id);

            // Update product ratings if product_id exists
            if ($review->product_id) {
                $this->updateProductRating($review->product_id);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Merci pour votre avis!',
                'review' => $review->load(['reviewer', 'product']),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'ajout de l\'avis',
            ], 500);
        }
    }

    /**
     * Get reviews for a product.
     */
    public function getProductReviews(Product $product): JsonResponse
    {
        $reviews = Review::where('product_id', $product->id)
            ->approved()
            ->with(['reviewer', 'order'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
            'stats' => [
                'average' => round($reviews->avg('rating'), 1),
                'total' => $reviews->total(),
                'distribution' => $this->getRatingDistribution($product->id),
            ],
        ]);
    }

    /**
     * Get reviews for an agriculteur.
     */
    public function getAgriculteurReviews(Request $request, $agriculteurId): JsonResponse
    {
        $reviews = Review::where('reviewee_id', $agriculteurId)
            ->approved()
            ->with(['reviewer', 'product', 'order'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Agriculteur responds to a review.
     */
    public function respondToReview(Request $request, Review $review): JsonResponse
    {
        $request->validate([
            'response' => 'required|string|max:500',
        ]);

        $user = $request->user();

        // Check if user is the reviewee (agriculteur)
        if ($review->reviewee_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous ne pouvez répondre qu\'aux avis vous concernant',
            ], 403);
        }

        // Check if already responded
        if ($review->hasResponse()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous avez déjà répondu à cet avis',
            ], 400);
        }

        $review->update([
            'response' => $request->response,
            'responded_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Réponse ajoutée avec succès',
            'review' => $review->fresh(),
        ]);
    }

    /**
     * Update agriculteur's average rating.
     */
    private function updateAgriculteurRating(int $agriculteurId): void
    {
        $agriculteur = Agriculteur::find($agriculteurId);
        if (!$agriculteur) return;

        $stats = Review::where('reviewee_id', $agriculteur->user_id)
            ->approved()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $agriculteur->update([
            'rating_average' => round($stats->avg_rating, 2),
            'rating_count' => $stats->total_reviews,
        ]);
    }

    /**
     * Update product's average rating.
     */
    private function updateProductRating(int $productId): void
    {
        $product = Product::find($productId);
        if (!$product) return;

        $stats = Review::where('product_id', $productId)
            ->approved()
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total_reviews')
            ->first();

        $product->update([
            'rating_average' => round($stats->avg_rating, 2),
            'rating_count' => $stats->total_reviews,
        ]);
    }

    /**
     * Get rating distribution for a product.
     */
    private function getRatingDistribution(int $productId): array
    {
        $distribution = Review::where('product_id', $productId)
            ->approved()
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        // Fill in missing ratings
        $result = [];
        for ($i = 5; $i >= 1; $i--) {
            $result[$i] = $distribution[$i] ?? 0;
        }

        return $result;
    }
}
