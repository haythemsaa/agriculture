<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'role',
        'first_name',
        'last_name',
        'email',
        'phone',
        'password',
        'avatar',
        'email_verified_at',
        'phone_verified_at',
        'status',
        'language',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function agriculteur()
    {
        return $this->hasOne(Agriculteur::class);
    }

    public function acheteur()
    {
        return $this->hasOne(Acheteur::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function aiRecommendations()
    {
        return $this->hasMany(AiRecommendation::class);
    }

    // Helper methods
    public function isAgriculteur(): bool
    {
        return $this->role === 'agriculteur';
    }

    public function isAcheteur(): bool
    {
        return $this->role === 'acheteur';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
