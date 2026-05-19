<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyPricing extends Model
{
    use HasUuids;

    protected $fillable = [
        'property_id',
        'name',
        'price_per_night',
        'start_date',
        'end_date',
        'min_nights',
        'is_active',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'start_date'      => 'date',
        'end_date'        => 'date',
        'is_active'       => 'boolean',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForDate($query, $date)
    {
        return $query->where('start_date', '<=', $date)->where('end_date', '>=', $date);
    }
}
