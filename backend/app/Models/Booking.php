<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'reference', 'property_id', 'guest_id', 'owner_id',
        'check_in_date', 'check_out_date', 'nights_count',
        'adults_count', 'children_count', 'infants_count', 'pets_count',
        'base_price', 'cleaning_fee', 'security_deposit',
        'service_fee', 'discount_amount', 'total_amount', 'currency',
        'status', 'payment_status',
        'cancelled_at', 'cancellation_reason', 'refund_amount',
        'guest_message', 'owner_message',
        'guest_reviewed', 'owner_reviewed',
        'source', 'snapshot',
        'confirmed_at', 'completed_at',
    ];

    protected $casts = [
        'check_in_date'    => 'date',
        'check_out_date'   => 'date',
        'base_price'       => 'decimal:2',
        'cleaning_fee'     => 'decimal:2',
        'security_deposit' => 'decimal:2',
        'service_fee'      => 'decimal:2',
        'discount_amount'  => 'decimal:2',
        'total_amount'     => 'decimal:2',
        'refund_amount'    => 'decimal:2',
        'guest_reviewed'   => 'boolean',
        'owner_reviewed'   => 'boolean',
        'cancelled_at'     => 'datetime',
        'confirmed_at'     => 'datetime',
        'completed_at'     => 'datetime',
        'snapshot'         => 'array',
    ];

    // ─── Boot ─────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $booking) {
            $booking->reference = self::generateReference();
        });
    }

    private static function generateReference(): string
    {
        do {
            $ref = 'CHML-' . date('Y') . '-' . str_pad(random_int(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (self::where('reference', $ref)->exists());
        return $ref;
    }

    // ─── Relationships ────────────────────────────────────────────

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'guest_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class)->where('type', 'guest_to_property');
    }

    public function ownerReview(): HasOne
    {
        return $this->hasOne(Review::class)->where('type', 'owner_to_guest');
    }

    public function availabilityBlock(): HasOne
    {
        return $this->hasOne(AvailabilityBlock::class);
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopePending($query)    { return $query->where('status', 'pending'); }
    public function scopeConfirmed($query)  { return $query->where('status', 'confirmed'); }
    public function scopeCompleted($query)  { return $query->where('status', 'completed'); }
    public function scopeCancelled($query)  { return $query->whereIn('status', ['cancelled_by_guest', 'cancelled_by_owner', 'cancelled_by_admin']); }
    public function scopePaid($query)       { return $query->where('payment_status', 'paid'); }

    public function scopeUpcoming($query)
    {
        return $query->where('check_in_date', '>', now())
                     ->whereIn('status', ['pending', 'confirmed']);
    }

    public function scopeActive($query)
    {
        return $query->where('check_in_date', '<=', now())
                     ->where('check_out_date', '>=', now())
                     ->where('status', 'confirmed');
    }

    // ─── Helpers ─────────────────────────────────────────────────

    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isConfirmed(): bool  { return $this->status === 'confirmed'; }
    public function isCompleted(): bool  { return $this->status === 'completed'; }
    public function isCancelled(): bool  { return str_starts_with($this->status, 'cancelled'); }
    public function isPaid(): bool       { return $this->payment_status === 'paid'; }

    public function canBeCancelledByGuest(): bool
    {
        return in_array($this->status, ['pending', 'confirmed'])
            && $this->check_in_date->isFuture();
    }

    public function canBeReviewedByGuest(): bool
    {
        return $this->status === 'completed'
            && !$this->guest_reviewed
            && $this->check_out_date->diffInDays(now()) <= 14;
    }

    public function getTotalGuestsAttribute(): int
    {
        return $this->adults_count + $this->children_count + $this->infants_count;
    }
}
