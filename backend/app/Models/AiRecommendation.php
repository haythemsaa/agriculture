<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiRecommendation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'input_data',
        'recommendation',
        'confidence_score',
        'was_useful',
        'user_feedback',
    ];

    protected function casts(): array
    {
        return [
            'input_data' => 'array',
            'recommendation' => 'array',
            'confidence_score' => 'decimal:4',
            'was_useful' => 'boolean',
        ];
    }

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Scopes
    public function scopeByType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeHighConfidence($query, float $threshold = 0.75)
    {
        return $query->where('confidence_score', '>=', $threshold);
    }

    // Helper methods
    public function isHighConfidence(float $threshold = 0.75): bool
    {
        return $this->confidence_score >= $threshold;
    }

    public function recordFeedback(bool $useful, ?string $feedback = null): void
    {
        $this->update([
            'was_useful' => $useful,
            'user_feedback' => $feedback,
        ]);
    }
}
