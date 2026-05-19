<?php

namespace App\Services;

use App\DTOs\Booking\CreateBookingDTO;
use App\Events\Booking\BookingConfirmed;
use App\Events\Booking\BookingCreated;
use App\Events\Booking\BookingCancelled;
use App\Models\AvailabilityBlock;
use App\Models\Booking;
use App\Models\Property;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BookingService
{
    public function __construct(
        private readonly PaymentService $paymentService,
        private readonly NotificationService $notificationService,
    ) {}

    // ─── Create Booking ───────────────────────────────────────────

    public function create(CreateBookingDTO $dto, User $guest): array
    {
        $property = Property::with('owner')->published()->findOrFail($dto->propertyId);
        $checkIn  = Carbon::parse($dto->checkInDate);
        $checkOut = Carbon::parse($dto->checkOutDate);

        $this->validateBooking($property, $checkIn, $checkOut, $dto->adults + $dto->children);

        $pricing = $property->getPriceForDates($checkIn, $checkOut);

        return DB::transaction(function () use ($dto, $guest, $property, $checkIn, $checkOut, $pricing) {
            $booking = Booking::create([
                'property_id'      => $property->id,
                'guest_id'         => $guest->id,
                'owner_id'         => $property->owner_id,
                'check_in_date'    => $checkIn,
                'check_out_date'   => $checkOut,
                'nights_count'     => $pricing['nights'],
                'adults_count'     => $dto->adults,
                'children_count'   => $dto->children ?? 0,
                'infants_count'    => $dto->infants ?? 0,
                'pets_count'       => $dto->pets ?? 0,
                'base_price'       => $pricing['base_price'],
                'cleaning_fee'     => $pricing['cleaning_fee'],
                'service_fee'      => $pricing['service_fee'],
                'security_deposit' => $pricing['security_deposit'],
                'total_amount'     => $pricing['total'],
                'currency'         => $property->currency,
                'status'           => $property->instant_booking ? 'confirmed' : 'pending',
                'payment_status'   => 'pending',
                'guest_message'    => $dto->message,
                'source'           => 'web',
                'snapshot'         => [
                    'property_title_ar' => $property->title_ar,
                    'property_title_fr' => $property->title_fr,
                    'property_address'  => $property->address_street,
                    'owner_name'        => $property->owner->full_name,
                    'pricing'           => $pricing,
                ],
            ]);

            // Create payment intent
            $paymentIntent = $this->paymentService->createPaymentIntent($booking);

            // If instant booking, block availability
            if ($property->instant_booking) {
                $this->blockAvailability($booking);
                $booking->update(['confirmed_at' => now()]);
                event(new BookingConfirmed($booking));
            } else {
                event(new BookingCreated($booking));
            }

            $this->notificationService->notifyBookingCreated($booking);

            return [
                'booking'        => $booking->load(['property', 'guest']),
                'payment_intent' => $paymentIntent,
            ];
        });
    }

    // ─── Confirm Booking (Owner) ──────────────────────────────────

    public function confirm(Booking $booking, User $owner): Booking
    {
        $this->authorize($booking, $owner, 'owner');

        if (!$booking->isPending()) {
            throw new \App\Exceptions\BookingException('Booking cannot be confirmed', 422);
        }

        DB::transaction(function () use ($booking) {
            $booking->update([
                'status'       => 'confirmed',
                'confirmed_at' => now(),
            ]);
            $this->blockAvailability($booking);
            event(new BookingConfirmed($booking));
            $this->notificationService->notifyBookingConfirmed($booking);
        });

        return $booking->fresh();
    }

    // ─── Cancel Booking ───────────────────────────────────────────

    public function cancel(Booking $booking, User $actor, string $reason = null): Booking
    {
        if (!$booking->canBeCancelledByGuest() && $actor->id === $booking->guest_id) {
            throw new \App\Exceptions\BookingException('Booking cannot be cancelled', 422);
        }

        $cancelStatus = match ($actor->id) {
            $booking->guest_id  => 'cancelled_by_guest',
            $booking->owner_id  => 'cancelled_by_owner',
            default             => 'cancelled_by_admin',
        };

        $refundAmount = $this->calculateRefund($booking);

        DB::transaction(function () use ($booking, $cancelStatus, $reason, $refundAmount) {
            $booking->update([
                'status'              => $cancelStatus,
                'cancelled_at'        => now(),
                'cancellation_reason' => $reason,
                'refund_amount'       => $refundAmount,
            ]);

            // Remove availability block
            $booking->availabilityBlock?->delete();

            // Process refund
            if ($refundAmount > 0 && $booking->isPaid()) {
                $this->paymentService->refund($booking, $refundAmount);
            }

            event(new BookingCancelled($booking));
            $this->notificationService->notifyBookingCancelled($booking);
        });

        return $booking->fresh();
    }

    // ─── Complete Booking ─────────────────────────────────────────

    public function complete(Booking $booking): Booking
    {
        $booking->update([
            'status'       => 'completed',
            'completed_at' => now(),
        ]);
        $this->notificationService->notifyBookingCompleted($booking);
        return $booking->fresh();
    }

    // ─── Helpers ─────────────────────────────────────────────────

    private function validateBooking(Property $property, Carbon $checkIn, Carbon $checkOut, int $guests): void
    {
        if ($checkIn->isPast()) {
            throw new \App\Exceptions\BookingException('Check-in date must be in the future', 422);
        }

        if ($checkOut->lte($checkIn)) {
            throw new \App\Exceptions\BookingException('Check-out must be after check-in', 422);
        }

        $nights = $checkIn->diffInDays($checkOut);
        if ($nights < $property->min_nights) {
            throw new \App\Exceptions\BookingException("Minimum {$property->min_nights} nights required", 422);
        }

        if ($nights > $property->max_nights) {
            throw new \App\Exceptions\BookingException("Maximum {$property->max_nights} nights allowed", 422);
        }

        if ($guests > $property->max_guests) {
            throw new \App\Exceptions\BookingException("Maximum {$property->max_guests} guests allowed", 422);
        }

        if (!$property->isAvailable($checkIn, $checkOut)) {
            throw new \App\Exceptions\BookingException('Property not available for selected dates', 422);
        }
    }

    private function blockAvailability(Booking $booking): void
    {
        AvailabilityBlock::create([
            'property_id' => $booking->property_id,
            'start_date'  => $booking->check_in_date,
            'end_date'    => $booking->check_out_date->copy()->subDay(),
            'type'        => 'booked',
            'booking_id'  => $booking->id,
        ]);
    }

    private function calculateRefund(Booking $booking): float
    {
        if (!$booking->isPaid()) return 0;

        $daysUntilCheckIn = now()->diffInDays($booking->check_in_date, false);
        $policy = $booking->property->cancellation_policy ?? 'moderate';

        return match ($policy) {
            'flexible'     => $daysUntilCheckIn >= 1  ? $booking->total_amount : 0,
            'moderate'     => $daysUntilCheckIn >= 5  ? $booking->total_amount : ($daysUntilCheckIn >= 1 ? $booking->total_amount * 0.5 : 0),
            'strict'       => $daysUntilCheckIn >= 14 ? $booking->total_amount * 0.5 : 0,
            'super_strict' => 0,
            default        => 0,
        };
    }

    private function authorize(Booking $booking, User $user, string $role): void
    {
        $allowed = match ($role) {
            'owner'  => $booking->owner_id === $user->id,
            'guest'  => $booking->guest_id === $user->id,
            default  => false,
        };
        if (!$allowed && !$user->isAdmin()) {
            throw new \App\Exceptions\AuthException('Unauthorized', 403);
        }
    }
}
