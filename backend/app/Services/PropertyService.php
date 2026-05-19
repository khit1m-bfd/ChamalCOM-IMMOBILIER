<?php

namespace App\Services;

use App\DTOs\Property\CreatePropertyDTO;
use App\DTOs\Property\SearchPropertyDTO;
use App\DTOs\Property\UpdatePropertyDTO;
use App\Models\AvailabilityBlock;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Models\User;
use Carbon\Carbon;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PropertyService
{
    // ─── Search / List ────────────────────────────────────────────

    public function search(SearchPropertyDTO $dto): LengthAwarePaginator
    {
        $query = Property::with(['category', 'images' => fn ($q) => $q->where('is_cover', true), 'owner'])
            ->published();

        // Text search
        if ($dto->query) {
            $q = $dto->query;
            $query->where(function ($qb) use ($q) {
                $qb->where('title_ar', 'LIKE', "%{$q}%")
                   ->orWhere('title_fr', 'LIKE', "%{$q}%")
                   ->orWhere('address_city', 'LIKE', "%{$q}%")
                   ->orWhere('address_street', 'LIKE', "%{$q}%");
            });
        }

        // Location
        if ($dto->city)   $query->where('address_city', $dto->city);
        if ($dto->region) $query->where('address_region', $dto->region);

        // Dates availability
        if ($dto->checkIn && $dto->checkOut) {
            $checkIn  = Carbon::parse($dto->checkIn);
            $checkOut = Carbon::parse($dto->checkOut);
            $nights   = $checkIn->diffInDays($checkOut);
            $query->whereDoesntHave('availabilityBlocks', function ($q) use ($checkIn, $checkOut) {
                $q->where(function ($qb) use ($checkIn, $checkOut) {
                    $qb->whereBetween('start_date', [$checkIn, $checkOut->copy()->subDay()])
                       ->orWhereBetween('end_date', [$checkIn->copy()->addDay(), $checkOut])
                       ->orWhere(fn ($qb2) => $qb2->where('start_date', '<=', $checkIn)->where('end_date', '>=', $checkOut));
                });
            });
            $query->where('min_nights', '<=', $nights)->where('max_nights', '>=', $nights);
        }

        // Guests
        if ($dto->guests) $query->where('max_guests', '>=', $dto->guests);

        // Price
        if ($dto->minPrice) $query->where('price_per_night', '>=', $dto->minPrice);
        if ($dto->maxPrice) $query->where('price_per_night', '<=', $dto->maxPrice);

        // Bedrooms
        if ($dto->bedrooms)  $query->where('bedrooms', '>=', $dto->bedrooms);
        if ($dto->bathrooms) $query->where('bathrooms', '>=', $dto->bathrooms);

        // Category
        if ($dto->categoryId) $query->where('category_id', $dto->categoryId);

        // Amenities
        if ($dto->amenities) {
            foreach ($dto->amenities as $amenityId) {
                $query->whereHas('amenities', fn ($q) => $q->where('amenity_id', $amenityId));
            }
        }

        // Boolean filters
        if ($dto->instantBooking !== null) $query->where('instant_booking', $dto->instantBooking);
        if ($dto->petsAllowed !== null)    $query->where('pets_allowed', $dto->petsAllowed);

        // Sorting
        match ($dto->sortBy ?? 'recommended') {
            'price_asc'   => $query->orderBy('price_per_night', 'asc'),
            'price_desc'  => $query->orderBy('price_per_night', 'desc'),
            'rating'      => $query->orderBy('rating_average', 'desc'),
            'newest'      => $query->orderBy('created_at', 'desc'),
            default       => $query->orderByRaw('is_featured DESC, rating_average DESC, bookings_count DESC'),
        };

        return $query->paginate($dto->perPage ?? 12);
    }

    // ─── Create ───────────────────────────────────────────────────

    public function create(CreatePropertyDTO $dto, User $owner): Property
    {
        return DB::transaction(function () use ($dto, $owner) {
            $property = Property::create([
                'owner_id'     => $owner->id,
                'category_id'  => $dto->categoryId,
                'title_ar'     => $dto->titleAr,
                'title_fr'     => $dto->titleFr,
                'description_ar' => $dto->descriptionAr,
                'description_fr' => $dto->descriptionFr,
                'price_per_night' => $dto->pricePerNight,
                'price_per_week'  => $dto->pricePerWeek,
                'price_per_month' => $dto->pricePerMonth,
                'cleaning_fee'    => $dto->cleaningFee ?? 0,
                'security_deposit'=> $dto->securityDeposit ?? 0,
                'address_street'  => $dto->addressStreet,
                'address_city'    => $dto->addressCity ?? 'Oued Laou',
                'address_region'  => $dto->addressRegion ?? 'Tétouan-Al Hoceïma-Taounate',
                'latitude'        => $dto->latitude,
                'longitude'       => $dto->longitude,
                'max_guests'      => $dto->maxGuests,
                'bedrooms'        => $dto->bedrooms,
                'bathrooms'       => $dto->bathrooms,
                'beds'            => $dto->beds,
                'min_nights'      => $dto->minNights ?? 1,
                'max_nights'      => $dto->maxNights ?? 365,
                'check_in_hour'   => $dto->checkInHour ?? 14,
                'check_out_hour'  => $dto->checkOutHour ?? 11,
                'instant_booking' => $dto->instantBooking ?? false,
                'pets_allowed'    => $dto->petsAllowed ?? false,
                'smoking_allowed' => $dto->smokingAllowed ?? false,
                'cancellation_policy' => $dto->cancellationPolicy ?? 'moderate',
                'house_rules_ar'  => $dto->houseRulesAr,
                'house_rules_fr'  => $dto->houseRulesFr,
                'status'          => 'pending',
            ]);

            if ($dto->amenityIds) {
                $property->amenities()->sync($dto->amenityIds);
            }

            return $property->load(['category', 'amenities', 'images']);
        });
    }

    // ─── Update ───────────────────────────────────────────────────

    public function update(Property $property, UpdatePropertyDTO $dto): Property
    {
        return DB::transaction(function () use ($property, $dto) {
            $data = array_filter((array) $dto, fn ($v) => $v !== null);
            $property->update($data);

            if (isset($dto->amenityIds)) {
                $property->amenities()->sync($dto->amenityIds);
            }

            return $property->fresh(['category', 'amenities', 'images']);
        });
    }

    // ─── Upload Images ────────────────────────────────────────────

    public function uploadImages(Property $property, array $files): array
    {
        $uploaded = [];
        $isCoverSet = $property->images()->where('is_cover', true)->exists();
        $sortOrder = $property->images()->max('sort_order') ?? -1;

        foreach ($files as $index => $file) {
            $result = Cloudinary::upload($file->getRealPath(), [
                'folder'         => "chamalcom/properties/{$property->id}",
                'transformation' => [['quality' => 'auto', 'fetch_format' => 'auto']],
                'eager'          => [['width' => 400, 'height' => 300, 'crop' => 'fill']],
            ]);

            $image = PropertyImage::create([
                'property_id'   => $property->id,
                'url'           => $result->getSecurePath(),
                'public_id'     => $result->getPublicId(),
                'thumbnail_url' => $result->eager[0]['secure_url'] ?? null,
                'is_cover'      => !$isCoverSet && $index === 0,
                'sort_order'    => ++$sortOrder,
                'width'         => $result->getWidth(),
                'height'        => $result->getHeight(),
            ]);

            if (!$isCoverSet && $index === 0) $isCoverSet = true;
            $uploaded[] = $image;
        }

        return $uploaded;
    }

    // ─── Delete Image ─────────────────────────────────────────────

    public function deleteImage(Property $property, string $imageId): void
    {
        $image = $property->images()->findOrFail($imageId);
        Cloudinary::destroy($image->public_id);
        $image->delete();

        // If deleted was cover, assign new cover
        if ($image->is_cover) {
            $property->images()->orderBy('sort_order')->first()?->update(['is_cover' => true]);
        }
    }

    // ─── Availability ─────────────────────────────────────────────

    public function getAvailability(Property $property, string $month, string $year): array
    {
        $start = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $end   = $start->copy()->endOfMonth();

        $blocks = $property->availabilityBlocks()
            ->where('end_date', '>=', $start)
            ->where('start_date', '<=', $end)
            ->get();

        $blockedDates = [];
        foreach ($blocks as $block) {
            $current = $block->start_date->copy();
            while ($current->lte($block->end_date)) {
                $blockedDates[] = $current->format('Y-m-d');
                $current->addDay();
            }
        }

        return array_unique($blockedDates);
    }

    // ─── Update Property Stats ─────────────────────────────────────

    public function recalculateRating(Property $property): void
    {
        $stats = $property->reviews()->selectRaw('AVG(rating_overall) as avg, COUNT(*) as cnt')->first();
        $property->update([
            'rating_average' => round($stats->avg ?? 0, 2),
            'rating_count'   => $stats->cnt ?? 0,
        ]);
    }
}
