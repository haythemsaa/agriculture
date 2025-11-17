<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'agriculteur_id',
        'category_id',
        'name_ar',
        'name_fr',
        'name_en',
        'description_ar',
        'description_fr',
        'description_en',
        'images',
        'price_per_unit',
        'unit',
        'minimum_order',
        'stock_available',
        'harvest_date',
        'is_organic',
        'certifications',
        'origin',
        'tags',
        'status',
        'rating_average',
        'rating_count',
        'views_count',
        'sales_count',
    ];

    protected function casts(): array
    {
        return [
            'images' => 'array',
            'price_per_unit' => 'decimal:2',
            'minimum_order' => 'decimal:2',
            'stock_available' => 'decimal:2',
            'harvest_date' => 'date',
            'is_organic' => 'boolean',
            'certifications' => 'array',
            'tags' => 'array',
            'rating_average' => 'decimal:2',
        ];
    }

    // Relationships
    public function agriculteur()
    {
        return $this->belongsTo(Agriculteur::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeInStock($query)
    {
        return $query->where('stock_available', '>', 0);
    }

    public function scopeOrganic($query)
    {
        return $query->where('is_organic', true);
    }

    // Helper methods
    public function getName(string $locale = 'fr'): string
    {
        return $this->{"name_$locale"} ?? $this->name_fr;
    }

    public function getDescription(string $locale = 'fr'): ?string
    {
        return $this->{"description_$locale"} ?? $this->description_fr;
    }

    public function isAvailable(): bool
    {
        return $this->status === 'active' && $this->stock_available > 0;
    }

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }
}
