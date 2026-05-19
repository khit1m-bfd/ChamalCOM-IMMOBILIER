<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyImage extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'property_id', 'url', 'public_id', 'thumbnail_url',
        'alt_ar', 'alt_fr', 'is_cover', 'sort_order', 'width', 'height',
    ];

    protected $casts = ['is_cover' => 'boolean'];

    public function property(): BelongsTo { return $this->belongsTo(Property::class); }

    public function scopeCover($query)   { return $query->where('is_cover', true); }
}
