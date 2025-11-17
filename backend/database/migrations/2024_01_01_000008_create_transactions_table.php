<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->foreignId('order_id')->nullable()->constrained();
            $table->foreignId('user_id')->constrained();

            $table->enum('type', [
                'order_payment',
                'commission',
                'delivery_fee',
                'refund',
                'withdrawal',
                'subscription'
            ]);

            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['card', 'flouci', 'd17', 'bank_transfer', 'wallet']);
            $table->string('gateway')->nullable(); // paymee, flouci, d17
            $table->string('gateway_transaction_id')->nullable();

            $table->enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');

            $table->json('metadata')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
