<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Acheteur extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'buyer_type',
        'company_name',
        'tax_id',
        'delivery_addresses',
        'preferences',
        'total_spent',
        'total_orders',
        'loyalty_points',
    ];

    protected function casts(): array
    {
        return [
            'delivery_addresses' => 'array',
            'preferences' => 'array',
            'total_spent' => 'decimal:2',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'buyer_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    // Helper methods
    public function isProfessional(): bool
    {
        return in_array($this->buyer_type, ['restaurant', 'hotel', 'epicerie']);
    }

    public function addLoyaltyPoints(int $points): void
    {
        $this->increment('loyalty_points', $points);
    }
}
