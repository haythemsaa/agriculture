<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agriculteurs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('farm_name');
            $table->text('bio')->nullable();
            $table->integer('experience_years')->default(0);
            $table->json('certifications')->nullable(); // ['bio', 'aoc', 'halal']
            $table->json('specializations')->nullable(); // ['fruits', 'legumes', 'cereales']
            $table->decimal('farm_size', 10, 2)->nullable(); // hectares

            // Location
            $table->string('governorate');
            $table->string('delegation');
            $table->string('locality')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Verification
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending');
            $table->text('verification_documents')->nullable();
            $table->timestamp('verified_at')->nullable();

            // Stats
            $table->decimal('rating_average', 3, 2)->default(0);
            $table->integer('rating_count')->default(0);
            $table->decimal('total_sales', 12, 2)->default(0);
            $table->integer('total_orders')->default(0);

            $table->boolean('is_premium')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agriculteurs');
    }
};
