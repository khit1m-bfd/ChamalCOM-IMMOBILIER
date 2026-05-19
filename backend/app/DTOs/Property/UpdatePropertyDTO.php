<?php

namespace App\DTOs\Property;

class UpdatePropertyDTO
{
    public function __construct(
        public readonly ?string $title_ar            = null,
        public readonly ?string $title_fr            = null,
        public readonly ?string $description_ar      = null,
        public readonly ?string $description_fr      = null,
        public readonly ?string $category_id         = null,
        public readonly ?string $city                = null,
        public readonly ?string $address             = null,
        public readonly ?float  $latitude            = null,
        public readonly ?float  $longitude           = null,
        public readonly ?float  $price_per_night     = null,
        public readonly ?float  $cleaning_fee        = null,
        public readonly ?float  $security_deposit    = null,
        public readonly ?int    $max_guests          = null,
        public readonly ?int    $bedrooms            = null,
        public readonly ?int    $bathrooms           = null,
        public readonly ?int    $beds                = null,
        public readonly ?int    $min_nights          = null,
        public readonly ?int    $max_nights          = null,
        public readonly ?string $booking_type        = null,
        public readonly ?string $cancellation_policy = null,
        public readonly ?string $status              = null,
        public readonly ?string $rules               = null,
        public readonly ?array  $amenity_ids         = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            title_ar:            $data['title_ar']            ?? null,
            title_fr:            $data['title_fr']            ?? null,
            description_ar:      $data['description_ar']      ?? null,
            description_fr:      $data['description_fr']      ?? null,
            category_id:         $data['category_id']         ?? null,
            city:                $data['city']                ?? null,
            address:             $data['address']             ?? null,
            latitude:            isset($data['latitude'])     ? (float) $data['latitude']  : null,
            longitude:           isset($data['longitude'])    ? (float) $data['longitude'] : null,
            price_per_night:     isset($data['price_per_night'])  ? (float) $data['price_per_night']  : null,
            cleaning_fee:        isset($data['cleaning_fee'])     ? (float) $data['cleaning_fee']     : null,
            security_deposit:    isset($data['security_deposit']) ? (float) $data['security_deposit'] : null,
            max_guests:          isset($data['max_guests'])   ? (int) $data['max_guests']   : null,
            bedrooms:            isset($data['bedrooms'])     ? (int) $data['bedrooms']     : null,
            bathrooms:           isset($data['bathrooms'])    ? (int) $data['bathrooms']    : null,
            beds:                isset($data['beds'])         ? (int) $data['beds']         : null,
            min_nights:          isset($data['min_nights'])   ? (int) $data['min_nights']   : null,
            max_nights:          isset($data['max_nights'])   ? (int) $data['max_nights']   : null,
            booking_type:        $data['booking_type']        ?? null,
            cancellation_policy: $data['cancellation_policy'] ?? null,
            status:              $data['status']              ?? null,
            rules:               $data['rules']               ?? null,
            amenity_ids:         $data['amenities']           ?? null,
        );
    }

    public function toArray(): array
    {
        return array_filter([
            'title_ar'            => $this->title_ar,
            'title_fr'            => $this->title_fr,
            'description_ar'      => $this->description_ar,
            'description_fr'      => $this->description_fr,
            'category_id'         => $this->category_id,
            'city'                => $this->city,
            'address'             => $this->address,
            'latitude'            => $this->latitude,
            'longitude'           => $this->longitude,
            'price_per_night'     => $this->price_per_night,
            'cleaning_fee'        => $this->cleaning_fee,
            'security_deposit'    => $this->security_deposit,
            'max_guests'          => $this->max_guests,
            'bedrooms'            => $this->bedrooms,
            'bathrooms'           => $this->bathrooms,
            'beds'                => $this->beds,
            'min_nights'          => $this->min_nights,
            'max_nights'          => $this->max_nights,
            'booking_type'        => $this->booking_type,
            'cancellation_policy' => $this->cancellation_policy,
            'status'              => $this->status,
            'rules'               => $this->rules,
        ], fn($v) => $v !== null);
    }
}
