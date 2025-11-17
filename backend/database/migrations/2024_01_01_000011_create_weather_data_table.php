<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('weather_data', function (Blueprint $table) {
            $table->id();
            $table->string('governorate');
            $table->string('delegation')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);

            $table->dateTime('forecast_time');
            $table->decimal('temperature', 5, 2);
            $table->decimal('feels_like', 5, 2)->nullable();
            $table->integer('humidity');
            $table->decimal('precipitation', 5, 2)->default(0);
            $table->decimal('wind_speed', 5, 2);
            $table->string('wind_direction')->nullable();
            $table->string('condition'); // clear, cloudy, rain, etc.
            $table->string('icon')->nullable();

            // Alerts
            $table->boolean('is_alert')->default(false);
            $table->string('alert_type')->nullable(); // frost, heat, storm, etc.
            $table->text('alert_message')->nullable();

            $table->timestamps();

            $table->index(['governorate', 'forecast_time']);
            $table->index(['latitude', 'longitude', 'forecast_time']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weather_data');
    }
};
