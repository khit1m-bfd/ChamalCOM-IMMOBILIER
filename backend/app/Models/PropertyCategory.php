<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PropertyCategory extends Model
{
    use HasFactory, HasUuids;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name_ar', 'name_fr', 'slug', 'icon',
        'description_ar', 'description_fr', 'active', 'sort_order',
    ];

    protected $casts = ['active' => 'boolean'];

    public function properties(): HasMany { return $this->hasMany(Property::class, 'category_id'); }

    public function getNameAttribute(): string
    {
        return app()->getLocale() === 'fr' ? ($this->name_fr ?: $this->name_ar) : $this->name_ar;
    }

    public function scopeActive($query) { return $query->where('active', true)->orderBy('sort_order'); }
}
