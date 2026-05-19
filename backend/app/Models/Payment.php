<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'booking_id', 'user_id', 'stripe_payment_intent_id',
        'stripe_charge_id', 'amount', 'currency', 'type',
        'status', 'payment_method', 'payment_details',
        'failure_reason', 'paid_at',
    ];

    protected $casts = [
        'amount'          => 'decimal:2',
        'payment_details' => 'array',
        'paid_at'         => 'datetime',
    ];

    public function booking(): BelongsTo { return $this->belongsTo(Booking::class); }
    public function user(): BelongsTo    { return $this->belongsTo(User::class); }

    public function scopeSucceeded($query) { return $query->where('status', 'succeeded'); }
    public function isSucceeded(): bool    { return $this->status === 'succeeded'; }
    public function isFailed(): bool       { return $this->status === 'failed'; }
}
