<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\WeatherController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ReviewController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // Public routes
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);

    // Products - public browsing
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);
    Route::get('/products/{id}/similar', [ProductController::class, 'similar']);

    // Categories - public
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{id}', [CategoryController::class, 'show']);
    Route::get('/categories/tree', [CategoryController::class, 'tree']);

    // Weather - public
    Route::get('/weather/current', [WeatherController::class, 'current']);
    Route::get('/weather/forecast', [WeatherController::class, 'forecast']);
    Route::get('/weather/alerts', [WeatherController::class, 'alerts']);

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

        // Products - authenticated
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{id}', [OrderController::class, 'show']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

        // Reviews
        Route::post('/orders/{order}/review', [ReviewController::class, 'addOrderReview']);
        Route::get('/products/{product}/reviews', [ReviewController::class, 'getProductReviews']);
        Route::get('/agriculteurs/{agriculteurId}/reviews', [ReviewController::class, 'getAgriculteurReviews']);
        Route::post('/reviews/{review}/respond', [ReviewController::class, 'respondToReview']);

        // Favorites
        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/{product}', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{product}', [FavoriteController::class, 'destroy']);
        Route::post('/favorites/{product}/toggle', [FavoriteController::class, 'toggle']);
        Route::get('/favorites/{product}/check', [FavoriteController::class, 'check']);

        // Messages (will be implemented with WebSocket)
        // Route::resource('conversations', ConversationController::class);
        // Route::post('/conversations/{id}/messages', [MessageController::class, 'send']);

        // AI Recommendations (Phase 2)
        // Route::post('/ai/detect-disease', [AiController::class, 'detectDisease']);
        // Route::post('/ai/predict-yield', [AiController::class, 'predictYield']);
        // Route::get('/ai/recommendations', [AiController::class, 'getRecommendations']);
    });
});

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'version' => '1.0.0',
    ]);
});
