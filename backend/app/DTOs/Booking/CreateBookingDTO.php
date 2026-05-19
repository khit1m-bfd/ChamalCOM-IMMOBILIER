<?php

namespace App\DTOs\Booking;

use Illuminate\Http\Request;

readonly class CreateBookingDTO
{
    public function __construct(
        public string  $propertyId,
        public string  $checkInDate,
        public string  $checkOutDate,
        public int     $adults,
        public ?int    $children = 0,
        public ?int    $infants  = 0,
        public ?int    $pets     = 0,
        public ?string $message  = null,
    ) {}

    public static function fromRequest(Request $request): self
    {
        return new self(
            propertyId:   $request->property_id,
            checkInDate:  $request->check_in_date,
            checkOutDate: $request->check_out_date,
            adults:       (int) $request->adults,
            children:     (int) ($request->children ?? 0),
            infants:      (int) ($request->infants ?? 0),
            pets:         (int) ($request->pets ?? 0),
            message:      $request->message,
        );
    }
}
