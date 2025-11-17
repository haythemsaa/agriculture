<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained();
            $table->foreignId('reviewer_id')->constrained('users'); // buyer
            $table->foreignId('reviewee_id')->constrained('users'); // agriculteur
            $table->foreignId('product_id')->nullable()->constrained();

            $table->tinyInteger('rating'); // 1-5
            $table->text('comment')->nullable();
            $table->json('images')->nullable();

            // Response from agriculteur
            $table->text('response')->nullable();
            $table->timestamp('responded_at')->nullable();

            $table->boolean('is_verified_purchase')->default(true);
            $table->boolean('is_approved')->default(true);

            $table->timestamps();

            $table->unique(['order_id', 'reviewer_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
