<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->enum('type', [
                'product_recommendation',
                'crop_suggestion',
                'disease_detection',
                'yield_prediction',
                'price_optimization'
            ]);

            $table->json('input_data');
            $table->json('recommendation');
            $table->decimal('confidence_score', 5, 4)->nullable();

            $table->boolean('was_useful')->nullable();
            $table->text('user_feedback')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'type', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_recommendations');
    }
};
