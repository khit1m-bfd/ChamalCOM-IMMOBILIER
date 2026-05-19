<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class OTP extends Model
{
    use HasUuids;

    protected $table = 'otps';

    protected $fillable = [
        'identifier',
        'type',
        'purpose',
        'code',
        'used',
        'attempts',
        'expires_at',
        'used_at',
        'ip_address',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at'    => 'datetime',
        'used'       => 'boolean',
    ];

    protected $hidden = ['code'];

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return (bool) $this->used || $this->used_at !== null;
    }

    public function isValid(): bool
    {
        return !$this->isExpired() && !$this->isUsed();
    }

    public function markAsUsed(): void
    {
        $this->update(['used' => true, 'used_at' => now()]);
    }

    public function scopeForIdentifier($query, string $identifier)
    {
        return $query->where('identifier', $identifier);
    }

    public function scopeOfType($query, string $type)
    {
        return $query->where('type', $type);
    }

    public function scopeOfPurpose($query, string $purpose)
    {
        return $query->where('purpose', $purpose);
    }

    public function scopeValid($query)
    {
        return $query->where('used', false)->where('expires_at', '>', now());
    }
}
