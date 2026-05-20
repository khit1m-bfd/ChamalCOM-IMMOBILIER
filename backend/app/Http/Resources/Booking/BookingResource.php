<?php

namespace App\Http\Resources\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'reference'      => $this->reference,
            'status'         => str_starts_with($this->status, 'cancelled') ? 'cancelled' : $this->status,
            'payment_status' => $this->payment_status,
            'dates'          => [
                'check_in'    => $this->check_in_date?->format('Y-m-d'),
                'check_out'   => $this->check_out_date?->format('Y-m-d'),
                'nights'      => $this->nights_count,
            ],
            'guests'         => [
                'adults'   => $this->adults_count,
                'children' => $this->children_count,
                'infants'  => $this->infants_count,
                'pets'     => $this->pets_count,
                'total'    => $this->total_guests,
            ],
            'pricing'        => [
                'base_price'       => (float) $this->base_price,
                'cleaning_fee'     => (float) $this->cleaning_fee,
                'service_fee'      => (float) $this->service_fee,
                'security_deposit' => (float) $this->security_deposit,
                'discount'         => (float) $this->discount_amount,
                'total'            => (float) $this->total_amount,
                'currency'         => $this->currency,
                'refund_amount'    => (float) $this->refund_amount,
            ],
            'property'       => $this->whenLoaded('property', fn () => [
                'id'          => $this->property->id,
                'title'       => ['ar' => $this->property->title_ar, 'fr' => $this->property->title_fr],
                'address'     => $this->property->address_street . ', ' . $this->property->address_city,
                'cover_image' => $this->property->cover_image,
                'check_in_hour'  => $this->property->check_in_hour,
                'check_out_hour' => $this->property->check_out_hour,
            ]),
            'guest'          => $this->whenLoaded('guest', fn () => [
                'id'     => $this->guest->id,
                'name'   => $this->guest->full_name,
                'email'  => $this->guest->email,
                'avatar' => $this->guest->avatar,
            ]),
            'owner'          => $this->whenLoaded('owner', fn () => [
                'id'     => $this->owner->id,
                'name'   => $this->owner->full_name,
                'avatar' => $this->owner->avatar,
            ]),
            'messages'       => [
                'guest' => $this->guest_message,
                'owner' => $this->owner_message,
            ],
            'cancellation'   => $this->when($this->isCancelled(), [
                'cancelled_at' => $this->cancelled_at?->toISOString(),
                'reason'       => $this->cancellation_reason,
                'refund'       => (float) $this->refund_amount,
            ]),
            'review'         => $this->whenLoaded('review'),
            'can_cancel'     => $this->canBeCancelledByGuest(),
            'can_review'     => $this->canBeReviewedByGuest(),
            'confirmed_at'   => $this->confirmed_at?->toISOString(),
            'completed_at'   => $this->completed_at?->toISOString(),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
