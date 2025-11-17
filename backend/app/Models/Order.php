<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'buyer_id',
        'agriculteur_id',
        'status',
        'payment_status',
        'delivery_type',
        'delivery_address',
        'delivery_date',
        'delivery_time_slot',
        'delivery_notes',
        'subtotal',
        'commission',
        'delivery_fee',
        'discount',
        'total_amount',
        'payment_method',
        'payment_transaction_id',
        'paid_at',
        'status_history',
        'cancellation_reason',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'delivery_address' => 'array',
            'delivery_date' => 'datetime',
            'subtotal' => 'decimal:2',
            'commission' => 'decimal:2',
            'delivery_fee' => 'decimal:2',
            'discount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'status_history' => 'array',
            'cancelled_at' => 'datetime',
        ];
    }

    // Relationships
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }

    public function agriculteur()
    {
        return $this->belongsTo(User::class, 'agriculteur_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'delivered');
    }

    // Helper methods
    public function updateStatus(string $newStatus, ?string $note = null): void
    {
        $history = $this->status_history ?? [];
        $history[] = [
            'status' => $newStatus,
            'timestamp' => now()->toIso8601String(),
            'note' => $note,
        ];

        $this->update([
            'status' => $newStatus,
            'status_history' => $history,
        ]);
    }

    public function isPaid(): bool
    {
        return $this->payment_status === 'paid';
    }

    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }
}
