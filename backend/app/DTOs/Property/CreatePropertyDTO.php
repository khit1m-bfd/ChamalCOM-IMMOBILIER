<?php

namespace App\DTOs\Property;

use Illuminate\Http\Request;

readonly class CreatePropertyDTO
{
    public function __construct(
        public string  $categoryId,
        public string  $titleAr,
        public ?string $titleFr,
        public string  $descriptionAr,
        public ?string $descriptionFr,
        public float   $pricePerNight,
        public ?float  $pricePerWeek,
        public ?float  $pricePerMonth,
        public ?float  $cleaningFee,
        public ?float  $securityDeposit,
        public string  $addressStreet,
        public ?string $addressCity,
        public ?string $addressRegion,
        public ?float  $latitude,
        public ?float  $longitude,
        public int     $maxGuests,
        public int     $bedrooms,
        public int     $bathrooms,
        public int     $beds,
        public ?int    $minNights,
        public ?int    $maxNights,
        public ?int    $checkInHour,
        public ?int    $checkOutHour,
        public ?bool   $instantBooking,
        public ?bool   $petsAllowed,
        public ?bool   $smokingAllowed,
        public ?string $cancellationPolicy,
        public ?string $houseRulesAr,
        public ?string $houseRulesFr,
        public ?array  $amenityIds,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            categoryId:         $request->category_id,
            titleAr:            $request->title_ar,
            titleFr:            $request->title_fr,
            descriptionAr:      $request->description_ar,
            descriptionFr:      $request->description_fr,
            pricePerNight:      $request->price_per_night,
            pricePerWeek:       $request->price_per_week,
            pricePerMonth:      $request->price_per_month,
            cleaningFee:        $request->cleaning_fee,
            securityDeposit:    $request->security_deposit,
            addressStreet:      $request->address_street,
            addressCity:        $request->address_city,
            addressRegion:      $request->address_region,
            latitude:           $request->latitude,
            longitude:          $request->longitude,
            maxGuests:          $request->max_guests,
            bedrooms:           $request->bedrooms,
            bathrooms:          $request->bathrooms,
            beds:               $request->beds,
            minNights:          $request->min_nights,
            maxNights:          $request->max_nights,
            checkInHour:        $request->check_in_hour,
            checkOutHour:       $request->check_out_hour,
            instantBooking:     $request->instant_booking,
            petsAllowed:        $request->pets_allowed,
            smokingAllowed:     $request->smoking_allowed,
            cancellationPolicy: $request->cancellation_policy,
            houseRulesAr:       $request->house_rules_ar,
            houseRulesFr:       $request->house_rules_fr,
            amenityIds:         $request->amenity_ids,
        );
    }
}
