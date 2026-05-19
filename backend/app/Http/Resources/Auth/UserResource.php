<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'first_name'      => $this->first_name,
            'last_name'       => $this->last_name,
            'full_name'       => $this->full_name,
            'email'           => $this->email,
            'phone'           => $this->phone,
            'avatar'          => $this->avatar,
            'status'          => $this->status,
            'locale'          => $this->locale,
            'email_verified'  => $this->email_verified,
            'phone_verified'  => $this->phone_verified,
            'two_factor_enabled' => $this->two_factor_enabled,
            'role'            => $this->getRoleNames()->first(),
            'permissions'     => $this->getAllPermissions()->pluck('name'),
            'profile'         => $this->whenLoaded('profile', fn () => [
                'bio'              => $this->profile?->bio,
                'date_of_birth'    => $this->profile?->date_of_birth?->format('Y-m-d'),
                'gender'           => $this->profile?->gender,
                'nationality'      => $this->profile?->nationality,
                'address_city'     => $this->profile?->address_city,
                'rating_average'   => $this->profile?->rating_average,
                'rating_count'     => $this->profile?->rating_count,
                'is_verified_host' => $this->profile?->is_verified_host,
                'host_since'       => $this->profile?->host_since?->format('Y-m-d'),
                'languages_spoken' => $this->profile?->languages_spoken,
            ]),
            'created_at'      => $this->created_at?->toISOString(),
            'last_login_at'   => $this->last_login_at?->toISOString(),
        ];
    }
}
