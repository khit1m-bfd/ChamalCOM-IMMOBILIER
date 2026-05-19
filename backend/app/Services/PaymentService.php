<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Stripe\StripeClient;

class PaymentService
{
    private ?StripeClient $stripe = null;

    public function __construct()
    {
        $key = config('services.stripe.secret');
        // Only use real Stripe keys (sk_test_... or sk_live_... with sufficient length)
        $isReal = $key
            && strlen($key) > 20
            && (str_starts_with($key, 'sk_test_') || str_starts_with($key, 'sk_live_'))
            && $key !== 'sk_test_demo';

        if ($isReal) {
            $this->stripe = new StripeClient($key);
        }
    }

    public function createPaymentIntent(Booking $booking): array
    {
        // Demo mode: no Stripe key configured
        if (!isset($this->stripe)) {
            Payment::create([
                'booking_id'               => $booking->id,
                'user_id'                  => $booking->guest_id,
                'stripe_payment_intent_id' => 'demo_' . strtoupper(\Illuminate\Support\Str::random(12)),
                'amount'                   => $booking->total_amount,
                'currency'                 => $booking->currency,
                'type'                     => 'booking',
                'status'                   => 'pending',
                'payment_method'           => 'card',
            ]);
            return [
                'client_secret'     => null,
                'payment_intent_id' => null,
                'demo_mode'         => true,
            ];
        }

        $intent = $this->stripe->paymentIntents->create([
            'amount'      => (int) ($booking->total_amount * 100), // cents
            'currency'    => strtolower($booking->currency === 'MAD' ? 'mad' : $booking->currency),
            'metadata'    => [
                'booking_id'  => $booking->id,
                'booking_ref' => $booking->reference,
                'guest_id'    => $booking->guest_id,
            ],
            'description' => "ChamalCom Booking {$booking->reference}",
        ]);

        Payment::create([
            'booking_id'                => $booking->id,
            'user_id'                   => $booking->guest_id,
            'stripe_payment_intent_id'  => $intent->id,
            'amount'                    => $booking->total_amount,
            'currency'                  => $booking->currency,
            'type'                      => 'booking',
            'status'                    => 'pending',
            'payment_method'            => 'card',
        ]);

        return [
            'client_secret'     => $intent->client_secret,
            'payment_intent_id' => $intent->id,
        ];
    }

    public function confirmPayment(string $paymentIntentId): Payment
    {
        if (!$this->stripe || str_starts_with($paymentIntentId, 'demo_')) {
            $payment = Payment::where('stripe_payment_intent_id', $paymentIntentId)->firstOrFail();
            $payment->update(['status' => 'succeeded', 'paid_at' => now()]);
            $payment->booking->update(['payment_status' => 'paid']);
            return $payment->fresh();
        }

        $intent  = $this->stripe->paymentIntents->retrieve($paymentIntentId);
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntentId)->firstOrFail();

        $status = match ($intent->status) {
            'succeeded' => 'succeeded',
            'canceled'  => 'cancelled',
            default     => 'processing',
        };

        $payment->update([
            'status'  => $status,
            'paid_at' => $status === 'succeeded' ? now() : null,
            'payment_details' => [
                'stripe_status'         => $intent->status,
                'payment_method_type'   => $intent->payment_method_types[0] ?? null,
            ],
        ]);

        if ($status === 'succeeded') {
            $payment->booking->update(['payment_status' => 'paid']);
        }

        return $payment->fresh();
    }

    public function refund(Booking $booking, float $amount): Payment
    {
        $originalPayment = $booking->payments()->succeeded()->latest()->first();

        if (!$this->stripe || str_starts_with($originalPayment?->stripe_payment_intent_id ?? '', 'demo_')) {
            return Payment::create([
                'booking_id'     => $booking->id,
                'user_id'        => $booking->guest_id,
                'amount'         => $amount,
                'currency'       => $booking->currency,
                'type'           => 'refund',
                'status'         => 'succeeded',
                'payment_method' => 'card',
                'paid_at'        => now(),
            ]);
        }

        $refund = $this->stripe->refunds->create([
            'payment_intent' => $originalPayment->stripe_payment_intent_id,
            'amount'         => (int) ($amount * 100),
        ]);

        $refundPayment = Payment::create([
            'booking_id'     => $booking->id,
            'user_id'        => $booking->guest_id,
            'amount'         => $amount,
            'currency'       => $booking->currency,
            'type'           => 'refund',
            'status'         => $refund->status === 'succeeded' ? 'succeeded' : 'processing',
            'payment_details'=> ['stripe_refund_id' => $refund->id],
            'paid_at'        => now(),
        ]);

        $booking->update([
            'payment_status' => $amount >= $booking->total_amount ? 'refunded' : 'partially_refunded',
        ]);

        return $refundPayment;
    }

    public function handleWebhook(array $payload): void
    {
        $type = $payload['type'] ?? '';
        $data = $payload['data']['object'] ?? [];

        match ($type) {
            'payment_intent.succeeded' => $this->confirmPayment($data['id']),
            'payment_intent.payment_failed' => $this->handlePaymentFailed($data),
            default => null,
        };
    }

    private function handlePaymentFailed(array $data): void
    {
        Payment::where('stripe_payment_intent_id', $data['id'])
            ->update([
                'status'         => 'failed',
                'failure_reason' => $data['last_payment_error']['message'] ?? 'Payment failed',
            ]);
    }
}
