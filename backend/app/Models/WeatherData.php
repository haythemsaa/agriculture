<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeatherData extends Model
{
    use HasFactory;

    protected $fillable = [
        'governorate',
        'delegation',
        'latitude',
        'longitude',
        'forecast_time',
        'temperature',
        'feels_like',
        'humidity',
        'precipitation',
        'wind_speed',
        'wind_direction',
        'condition',
        'icon',
        'is_alert',
        'alert_type',
        'alert_message',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'forecast_time' => 'datetime',
            'temperature' => 'decimal:2',
            'feels_like' => 'decimal:2',
            'precipitation' => 'decimal:2',
            'wind_speed' => 'decimal:2',
            'is_alert' => 'boolean',
        ];
    }

    // Scopes
    public function scopeAlerts($query)
    {
        return $query->where('is_alert', true);
    }

    public function scopeForLocation($query, string $governorate)
    {
        return $query->where('governorate', $governorate);
    }

    public function scopeCurrent($query)
    {
        return $query->where('forecast_time', '>=', now())
            ->orderBy('forecast_time')
            ->limit(1);
    }

    // Helper methods
    public function hasAlert(): bool
    {
        return $this->is_alert;
    }
}
