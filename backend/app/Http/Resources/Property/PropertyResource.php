<?php

namespace App\Http\Resources\Property;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'slug'           => $this->slug,
            'title'          => [
                'ar' => $this->title_ar,
                'fr' => $this->title_fr,
            ],
            'description'    => [
                'ar' => $this->description_ar,
                'fr' => $this->description_fr,
            ],
            'category'       => $this->whenLoaded('category', fn () => [
                'id'   => $this->category->id,
                'name' => ['ar' => $this->category->name_ar, 'fr' => $this->category->name_fr],
                'icon' => $this->category->icon,
                'slug' => $this->category->slug,
            ]),
            'pricing'        => [
                'per_night'   => (float) $this->price_per_night,
                'per_week'    => $this->price_per_week ? (float) $this->price_per_week : null,
                'per_month'   => $this->price_per_month ? (float) $this->price_per_month : null,
                'currency'    => $this->currency,
                'cleaning_fee'=> (float) $this->cleaning_fee,
                'security_deposit' => (float) $this->security_deposit,
            ],
            'location'       => [
                'street'  => $this->address_street,
                'city'    => $this->address_city,
                'region'  => $this->address_region,
                'country' => $this->address_country,
                'lat'     => $this->latitude ? (float) $this->latitude : null,
                'lng'     => $this->longitude ? (float) $this->longitude : null,
            ],
            'capacity'       => [
                'max_guests' => $this->max_guests,
                'bedrooms'   => $this->bedrooms,
                'bathrooms'  => $this->bathrooms,
                'beds'       => $this->beds,
            ],
            'rules'          => [
                'min_nights'          => $this->min_nights,
                'max_nights'          => $this->max_nights,
                'check_in_hour'       => $this->check_in_hour,
                'check_out_hour'      => $this->check_out_hour,
                'instant_booking'     => $this->instant_booking,
                'pets_allowed'        => $this->pets_allowed,
                'smoking_allowed'     => $this->smoking_allowed,
                'events_allowed'      => $this->events_allowed,
                'children_allowed'    => $this->children_allowed,
                'cancellation_policy' => $this->cancellation_policy,
                'house_rules'         => ['ar' => $this->house_rules_ar, 'fr' => $this->house_rules_fr],
            ],
            'images'         => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => [
                    'id'        => $img->id,
                    'url'       => $img->url,
                    'thumbnail' => $img->thumbnail_url ?? $img->url,
                    'is_cover'  => $img->is_cover,
                    'alt'       => ['ar' => $img->alt_ar, 'fr' => $img->alt_fr],
                ])
            ),
            'cover_image'    => $this->cover_image,
            'amenities'      => $this->whenLoaded('amenities', fn () =>
                $this->amenities->map(fn ($a) => [
                    'id'       => $a->id,
                    'name'     => ['ar' => $a->name_ar, 'fr' => $a->name_fr],
                    'icon'     => $a->icon,
                    'category' => $a->category,
                ])
            ),
            'owner'          => $this->whenLoaded('owner', fn () => [
                'id'               => $this->owner->id,
                'name'             => $this->owner->full_name,
                'avatar'           => $this->owner->avatar,
                'is_verified_host' => $this->owner->profile?->is_verified_host ?? false,
                'host_since'       => $this->owner->profile?->host_since?->format('Y-m-d'),
                'languages_spoken' => $this->owner->profile?->languages_spoken,
            ]),
            'stats'          => [
                'rating_average' => (float) $this->rating_average,
                'rating_count'   => $this->rating_count,
                'views_count'    => $this->views_count,
                'bookings_count' => $this->bookings_count,
                'favorites_count'=> $this->favorites_count,
            ],
            'status'         => $this->status,
            'is_featured'    => $this->is_featured,
            'is_verified'    => $this->is_verified,
            'reviews'        => $this->whenLoaded('reviews', fn () =>
                \App\Http\Resources\Review\ReviewResource::collection($this->reviews)
            ),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
