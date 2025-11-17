<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agriculteur_id')->constrained()->onDelete('cascade');
            $table->foreignId('category_id')->constrained();

            // Multi-language content
            $table->string('name_ar');
            $table->string('name_fr');
            $table->string('name_en');
            $table->text('description_ar')->nullable();
            $table->text('description_fr')->nullable();
            $table->text('description_en')->nullable();

            // Images (JSON array)
            $table->json('images');

            // Pricing
            $table->decimal('price_per_unit', 10, 2);
            $table->enum('unit', ['kg', 'g', 'l', 'ml', 'piece', 'bunch', 'box', 'bag']);
            $table->decimal('minimum_order', 10, 2)->default(1);
            $table->decimal('stock_available', 10, 2);

            // Product details
            $table->date('harvest_date')->nullable();
            $table->boolean('is_organic')->default(false);
            $table->json('certifications')->nullable(); // ['bio', 'aoc', 'halal']
            $table->string('origin'); // governorate
            $table->json('tags')->nullable(); // ['fresh', 'local', 'seasonal']

            // Status
            $table->enum('status', ['active', 'inactive', 'out_of_stock', 'pending'])->default('active');

            // Stats
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->integer('sales_count')->default(0);

            $table->timestamps();
            $table->softDeletes();

            // Indexes for search and filtering
            $table->index(['status', 'created_at']);
            $table->index(['category_id', 'status']);
            $table->index(['agriculteur_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
