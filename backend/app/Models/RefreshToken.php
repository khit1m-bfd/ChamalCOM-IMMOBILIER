<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RefreshToken extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'user_id', 'token', 'device_name', 'device_type',
        'ip_address', 'revoked', 'expires_at', 'last_used_at',
    ];

    protected $casts = [
        'revoked'      => 'boolean',
        'expires_at'   => 'datetime',
        'last_used_at' => 'datetime',
    ];

    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    public function isValid(): bool
    {
        return !$this->revoked && $this->expires_at->isFuture();
    }

    public function scopeValid($query)
    {
        return $query->where('revoked', false)->where('expires_at', '>', now());
    }
}
