<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('acheteurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('buyer_type', ['particulier', 'restaurant', 'hotel', 'epicerie', 'autre'])->default('particulier');
            $table->string('company_name')->nullable();
            $table->string('tax_id')->nullable();

            // Delivery addresses (JSON array)
            $table->json('delivery_addresses')->nullable();

            // Preferences (JSON)
            $table->json('preferences')->nullable(); // favorite categories, dietary preferences

            // Stats
            $table->decimal('total_spent', 12, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->integer('loyalty_points')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('acheteurs');
    }
};
