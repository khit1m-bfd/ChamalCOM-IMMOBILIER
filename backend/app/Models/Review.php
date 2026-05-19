<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Review extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'booking_id', 'property_id', 'reviewer_id', 'reviewee_id', 'type',
        'rating_overall', 'rating_cleanliness', 'rating_accuracy',
        'rating_communication', 'rating_location', 'rating_value',
        'comment_ar', 'comment_fr', 'is_public', 'is_approved',
    ];

    protected $casts = [
        'is_public'   => 'boolean',
        'is_approved' => 'boolean',
    ];

    public function booking(): BelongsTo  { return $this->belongsTo(Booking::class); }
    public function property(): BelongsTo { return $this->belongsTo(Property::class); }
    public function reviewer(): BelongsTo { return $this->belongsTo(User::class, 'reviewer_id'); }
    public function reviewee(): BelongsTo { return $this->belongsTo(User::class, 'reviewee_id'); }
    public function reply(): HasOne       { return $this->hasOne(ReviewReply::class); }

    public function getCommentAttribute(): ?string
    {
        $locale = app()->getLocale();
        return $locale === 'fr' ? ($this->comment_fr ?: $this->comment_ar) : $this->comment_ar;
    }

    public function getAverageRatingAttribute(): float
    {
        $fields = ['rating_cleanliness', 'rating_accuracy', 'rating_communication', 'rating_location', 'rating_value'];
        $values = array_filter(array_map(fn ($f) => $this->$f, $fields));
        return count($values) ? round(array_sum($values) / count($values), 2) : $this->rating_overall;
    }

    public function scopePublic($query)   { return $query->where('is_public', true)->where('is_approved', true); }
    public function scopeForProperty($query, string $propertyId)
    {
        return $query->where('property_id', $propertyId)->where('type', 'guest_to_property');
    }
}
