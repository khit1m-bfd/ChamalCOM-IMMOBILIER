<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    public function createIntent(Request $request, string $bookingId): JsonResponse
    {
        $booking = Booking::where('id', $bookingId)
            ->where('guest_id', $request->user()->id)
            ->where('payment_status', 'pending')
            ->firstOrFail();

        $intent = $this->paymentService->createPaymentIntent($booking);

        return response()->json([
            'data' => [
                'client_secret'       => $intent->client_secret,
                'payment_intent_id'   => $intent->id,
                'amount'              => $intent->amount,
                'currency'            => strtolower($intent->currency),
            ],
        ]);
    }

    public function confirmPayment(Request $request, string $bookingId): JsonResponse
    {
        $request->validate(['payment_intent_id' => 'required|string']);

        $booking = Booking::where('id', $bookingId)
            ->where('guest_id', $request->user()->id)
            ->firstOrFail();

        $result = $this->paymentService->confirmPayment($booking, $request->payment_intent_id);

        return response()->json([
            'message' => 'Payment confirmed',
            'data'    => $result,
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret    = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (SignatureVerificationException $e) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        match ($event->type) {
            'payment_intent.succeeded'              => $this->paymentService->handlePaymentSucceeded($event->data->object),
            'payment_intent.payment_failed'         => $this->paymentService->handlePaymentFailed($event->data->object),
            'charge.refunded'                       => $this->paymentService->handleRefund($event->data->object),
            default                                 => null,
        };

        return response()->json(['received' => true]);
    }

    public function getPayment(Request $request, string $bookingId): JsonResponse
    {
        $booking = Booking::where('id', $bookingId)
            ->where(fn($q) => $q->where('guest_id', $request->user()->id)
                ->orWhereHas('property', fn($q) => $q->where('owner_id', $request->user()->id)))
            ->with('payment')
            ->firstOrFail();

        return response()->json(['data' => $booking->payment]);
    }
}
