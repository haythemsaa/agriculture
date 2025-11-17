<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'reviewer_id',
        'reviewee_id',
        'product_id',
        'rating',
        'comment',
        'images',
        'response',
        'responded_at',
        'is_verified_purchase',
        'is_approved',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'responded_at' => 'datetime',
            'is_verified_purchase' => 'boolean',
            'is_approved' => 'boolean',
        ];
    }

    // Relationships
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewer_id');
    }

    public function reviewee()
    {
        return $this->belongsTo(User::class, 'reviewee_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeVerifiedPurchase($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    // Helper methods
    public function hasResponse(): bool
    {
        return !empty($this->response);
    }
}
