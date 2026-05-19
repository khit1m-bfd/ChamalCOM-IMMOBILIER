<?php

namespace App\DTOs\Property;

use Illuminate\Http\Request;

readonly class SearchPropertyDTO
{
    public function __construct(
        public ?string $query          = null,
        public ?string $city           = null,
        public ?string $region         = null,
        public ?string $checkIn        = null,
        public ?string $checkOut       = null,
        public ?int    $guests         = null,
        public ?float  $minPrice       = null,
        public ?float  $maxPrice       = null,
        public ?int    $bedrooms       = null,
        public ?int    $bathrooms      = null,
        public ?string $categoryId     = null,
        public ?array  $amenities      = null,
        public ?bool   $instantBooking = null,
        public ?bool   $petsAllowed    = null,
        public ?string $sortBy         = 'recommended',
        public ?int    $perPage        = 12,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            query:          $request->q,
            city:           $request->city,
            region:         $request->region,
            checkIn:        $request->check_in,
            checkOut:       $request->check_out,
            guests:         $request->guests ? (int) $request->guests : null,
            minPrice:       $request->min_price ? (float) $request->min_price : null,
            maxPrice:       $request->max_price ? (float) $request->max_price : null,
            bedrooms:       $request->bedrooms ? (int) $request->bedrooms : null,
            bathrooms:      $request->bathrooms ? (int) $request->bathrooms : null,
            categoryId:     $request->category_id,
            amenities:      $request->amenities,
            instantBooking: $request->has('instant_booking') ? (bool) $request->instant_booking : null,
            petsAllowed:    $request->has('pets_allowed') ? (bool) $request->pets_allowed : null,
            sortBy:         $request->sort_by ?? 'recommended',
            perPage:        min((int) ($request->per_page ?? 12), 50),
        );
    }
}
