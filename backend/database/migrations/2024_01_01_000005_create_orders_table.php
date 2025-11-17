<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('agriculteur_id')->constrained('users');

            // Status
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'in_delivery',
                'delivered',
                'cancelled',
                'refunded'
            ])->default('pending');

            $table->enum('payment_status', [
                'pending',
                'paid',
                'failed',
                'refunded'
            ])->default('pending');

            // Delivery
            $table->enum('delivery_type', ['pickup', 'home_delivery', 'relay_point', 'shipping']);
            $table->json('delivery_address')->nullable();
            $table->dateTime('delivery_date')->nullable();
            $table->string('delivery_time_slot')->nullable();
            $table->text('delivery_notes')->nullable();

            // Amounts
            $table->decimal('subtotal', 10, 2);
            $table->decimal('commission', 10, 2)->default(0);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // Payment
            $table->enum('payment_method', ['card', 'flouci', 'd17', 'bank_transfer', 'cod']);
            $table->string('payment_transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Tracking
            $table->json('status_history')->nullable();
            $table->text('cancellation_reason')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->index(['buyer_id', 'created_at']);
            $table->index(['agriculteur_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
