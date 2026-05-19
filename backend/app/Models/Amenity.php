<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Amenity extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = ['name_ar', 'name_fr', 'icon', 'category', 'active'];

    protected $casts = ['active' => 'boolean'];

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class, 'property_amenity');
    }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'fr' ? ($this->name_fr ?: $this->name_ar) : $this->name_ar;
    }

    public function scopeActive($query) { return $query->where('active', true); }
}
