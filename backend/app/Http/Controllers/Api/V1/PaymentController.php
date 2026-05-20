<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Booking\BookingResource;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    // POST /api/v1/payments/intent/{booking}  — create / retrieve payment intent
    public function createIntent(Request $request, string $bookingId): JsonResponse
    {
        $booking = Booking::where('id', $bookingId)
            ->where('guest_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        $intent = $this->paymentService->createPaymentIntent($booking);

        return response()->json([
            'success' => true,
            'data'    => $intent,
        ]);
    }

    // POST /api/v1/payments/confirm/{booking}  — confirm a payment intent
    public function confirmPayment(Request $request, string $bookingId): JsonResponse
    {
        $request->validate(['payment_intent_id' => 'required|string']);

        $booking = Booking::where('id', $bookingId)
            ->where('guest_id', $request->user()->id)
            ->firstOrFail();

        // In demo mode the intent id starts with "demo_"
        $payment = $this->paymentService->confirmPayment($request->payment_intent_id);

        return response()->json([
            'success' => true,
            'message' => 'Payment confirmed',
            'data'    => [
                'payment' => $payment,
                'booking' => BookingResource::make($booking->fresh(['property.images', 'guest', 'owner'])),
            ],
        ]);
    }

    // POST /api/v1/payments/demo-confirm/{booking} — one-click demo payment (no Stripe)
    public function demoConfirm(Request $request, string $bookingId): JsonResponse
    {
        $booking = Booking::where('id', $bookingId)
            ->where('guest_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        // Find or create demo payment
        $payment = $booking->payments()->where('status', 'pending')->latest()->first();

        if (!$payment) {
            $payment = Payment::create([
                'booking_id'               => $booking->id,
                'user_id'                  => $booking->guest_id,
                'stripe_payment_intent_id' => 'demo_' . strtoupper(\Illuminate\Support\Str::random(12)),
                'amount'                   => $booking->total_amount,
                'currency'                 => $booking->currency,
                'type'                     => 'booking',
                'status'                   => 'pending',
                'payment_method'           => 'card',
            ]);
        }

        // Auto-confirm
        $payment->update(['status' => 'succeeded', 'paid_at' => now()]);
        $booking->update(['payment_status' => 'paid']);

        return response()->json([
            'success' => true,
            'message' => 'Demo payment confirmed',
            'data'    => [
                'booking' => BookingResource::make($booking->fresh(['property.images', 'guest', 'owner'])),
            ],
        ]);
    }

    // GET /api/v1/payments/booking/{booking}
    public function getPayment(Request $request, string $bookingId): JsonResponse
    {
        $booking = Booking::where('id', $bookingId)
            ->where(fn ($q) => $q
                ->where('guest_id', $request->user()->id)
                ->orWhereHas('property', fn ($q2) => $q2->where('owner_id', $request->user()->id))
            )
            ->with('payments')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => $booking->payments()->latest()->first(),
        ]);
    }
}
