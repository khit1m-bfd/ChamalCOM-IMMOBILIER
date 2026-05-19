<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'owner_id', 'category_id', 'title_ar', 'title_fr',
        'description_ar', 'description_fr', 'slug',
        'price_per_night', 'price_per_week', 'price_per_month',
        'currency', 'security_deposit', 'cleaning_fee',
        'address_street', 'address_city', 'address_region',
        'address_country', 'address_postal', 'latitude', 'longitude',
        'location_description_ar', 'location_description_fr',
        'max_guests', 'bedrooms', 'bathrooms', 'beds',
        'min_nights', 'max_nights', 'check_in_hour', 'check_out_hour',
        'instant_booking', 'pets_allowed', 'smoking_allowed',
        'events_allowed', 'children_allowed',
        'house_rules_ar', 'house_rules_fr', 'cancellation_policy',
        'status', 'is_featured', 'is_verified',
        'meta_title_ar', 'meta_title_fr',
        'meta_description_ar', 'meta_description_fr',
    ];

    protected $casts = [
        'price_per_night'   => 'decimal:2',
        'price_per_week'    => 'decimal:2',
        'price_per_month'   => 'decimal:2',
        'security_deposit'  => 'decimal:2',
        'cleaning_fee'      => 'decimal:2',
        'latitude'          => 'decimal:7',
        'longitude'         => 'decimal:7',
        'instant_booking'   => 'boolean',
        'pets_allowed'      => 'boolean',
        'smoking_allowed'   => 'boolean',
        'events_allowed'    => 'boolean',
        'children_allowed'  => 'boolean',
        'is_featured'       => 'boolean',
        'is_verified'       => 'boolean',
        'rating_average'    => 'decimal:2',
    ];

    // ─── Boot ─────────────────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (self $property) {
            if (empty($property->slug)) {
                $property->slug = self::generateSlug($property->title_ar ?? $property->title_fr);
            }
        });
    }

    private static function generateSlug(string $title): string
    {
        $base = Str::slug($title) ?: Str::random(8);
        $slug = $base;
        $i = 1;
        while (self::where('slug', $slug)->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }
        return $slug;
    }

    // ─── Accessors ────────────────────────────────────────────────

    public function getTitleAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'fr' ? ($this->title_fr ?: $this->title_ar) : $this->title_ar;
    }

    public function getDescriptionAttribute(): string
    {
        $locale = app()->getLocale();
        return $locale === 'fr' ? ($this->description_fr ?: $this->description_ar) : $this->description_ar;
    }

    public function getCoverImageAttribute(): ?string
    {
        return $this->images()->where('is_cover', true)->value('url')
            ?? $this->images()->orderBy('sort_order')->value('url');
    }

    // ─── Relationships ────────────────────────────────────────────

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PropertyCategory::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    public function coverImage(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->where('is_cover', true);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity');
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('type', 'guest_to_property');
    }

    public function availabilityBlocks(): HasMany
    {
        return $this->hasMany(AvailabilityBlock::class);
    }

    public function favoritedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'favorites');
    }

    // ─── Scopes ──────────────────────────────────────────────────

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeInCity($query, string $city)
    {
        return $query->where('address_city', $city);
    }

    public function scopeWithCapacity($query, int $guests)
    {
        return $query->where('max_guests', '>=', $guests);
    }

    public function scopePriceBetween($query, float $min, float $max)
    {
        return $query->whereBetween('price_per_night', [$min, $max]);
    }

    // ─── Helpers ─────────────────────────────────────────────────

    public function isAvailable(\Carbon\Carbon $checkIn, \Carbon\Carbon $checkOut): bool
    {
        return !$this->availabilityBlocks()
            ->where(function ($q) use ($checkIn, $checkOut) {
                $q->whereBetween('start_date', [$checkIn, $checkOut])
                  ->orWhereBetween('end_date', [$checkIn, $checkOut])
                  ->orWhere(function ($q2) use ($checkIn, $checkOut) {
                      $q2->where('start_date', '<=', $checkIn)
                         ->where('end_date', '>=', $checkOut);
                  });
            })
            ->exists();
    }

    public function getPriceForDates(\Carbon\Carbon $checkIn, \Carbon\Carbon $checkOut): array
    {
        $nights = $checkIn->diffInDays($checkOut);
        $pricePerNight = $this->price_per_night;
        $basePrice = $pricePerNight * $nights;
        $serviceFee = round($basePrice * 0.10, 2);
        $total = $basePrice + $this->cleaning_fee + $serviceFee;

        return [
            'price_per_night' => $pricePerNight,
            'nights'          => $nights,
            'base_price'      => $basePrice,
            'cleaning_fee'    => $this->cleaning_fee,
            'service_fee'     => $serviceFee,
            'security_deposit'=> $this->security_deposit,
            'total'           => $total,
            'currency'        => $this->currency,
        ];
    }
}
