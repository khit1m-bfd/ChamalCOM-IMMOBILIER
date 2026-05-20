<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'first_name'        => $this->first_name,
            'last_name'         => $this->last_name,
            'full_name'         => $this->full_name,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'avatar'            => $this->avatar,
            'locale'            => $this->locale,
            'status'            => $this->status,
            'email_verified'    => (bool) $this->email_verified,
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'roles'             => $this->whenLoaded('roles', fn () =>
                $this->roles->pluck('name')
            ),
            'role'              => $this->whenLoaded('roles', fn () =>
                $this->roles->first()?->name
            ),
            'is_host_verified'  => (bool) ($this->whenLoaded('profile', fn () => $this->profile?->is_verified_host) ?? false),
            'profile'           => $this->whenLoaded('profile', fn () => [
                'bio'              => $this->profile?->bio,
                'city'             => $this->profile?->address_city,
                'is_verified_host' => (bool) $this->profile?->is_verified_host,
                'rating_average'   => $this->profile?->rating_average,
                'rating_count'     => $this->profile?->rating_count,
            ]),
            'properties_count'  => $this->whenCounted('properties'),
            'bookings_count'    => $this->whenCounted('bookingsAsGuest'),
            'last_login_at'             => $this->last_login_at?->toISOString(),
            'created_at'                => $this->created_at?->toISOString(),
        ];
    }
}
