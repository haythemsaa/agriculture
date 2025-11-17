<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agriculteur extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'farm_name',
        'bio',
        'experience_years',
        'certifications',
        'specializations',
        'farm_size',
        'governorate',
        'delegation',
        'locality',
        'latitude',
        'longitude',
        'verification_status',
        'verification_documents',
        'verified_at',
        'rating_average',
        'rating_count',
        'total_sales',
        'total_orders',
        'is_premium',
    ];

    protected function casts(): array
    {
        return [
            'certifications' => 'array',
            'specializations' => 'array',
            'farm_size' => 'decimal:2',
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
            'verified_at' => 'datetime',
            'rating_average' => 'decimal:2',
            'total_sales' => 'decimal:2',
            'is_premium' => 'boolean',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'agriculteur_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    // Helper methods
    public function isVerified(): bool
    {
        return $this->verification_status === 'verified';
    }

    public function hasCertification(string $cert): bool
    {
        return in_array($cert, $this->certifications ?? []);
    }
}
