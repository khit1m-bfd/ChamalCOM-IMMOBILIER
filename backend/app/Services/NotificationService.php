<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Message;
use App\Models\User;
use App\Notifications\Booking\BookingConfirmedNotification;
use App\Notifications\Booking\BookingCreatedNotification;
use App\Notifications\Booking\BookingCancelledNotification;
use App\Notifications\Booking\BookingCompletedNotification;
use App\Notifications\Message\NewMessageNotification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    public function notifyBookingCreated(Booking $booking): void
    {
        // Notify owner of new booking request
        $booking->owner->notify(new BookingCreatedNotification($booking));

        $this->pushToSocket('booking.created', $booking->owner_id, [
            'booking_id'  => $booking->id,
            'reference'   => $booking->reference,
            'guest_name'  => $booking->guest->full_name,
            'check_in'    => $booking->check_in_date->format('Y-m-d'),
            'check_out'   => $booking->check_out_date->format('Y-m-d'),
            'total'       => $booking->total_amount,
        ]);
    }

    public function notifyBookingConfirmed(Booking $booking): void
    {
        $booking->guest->notify(new BookingConfirmedNotification($booking));

        $this->pushToSocket('booking.confirmed', $booking->guest_id, [
            'booking_id'  => $booking->id,
            'reference'   => $booking->reference,
            'property'    => $booking->property->title_ar,
            'check_in'    => $booking->check_in_date->format('Y-m-d'),
            'check_out'   => $booking->check_out_date->format('Y-m-d'),
        ]);
    }

    public function notifyBookingCancelled(Booking $booking): void
    {
        $recipientId = str_starts_with($booking->status, 'cancelled_by_guest')
            ? $booking->owner_id
            : $booking->guest_id;

        User::find($recipientId)?->notify(new BookingCancelledNotification($booking));

        $this->pushToSocket('booking.cancelled', $recipientId, [
            'booking_id' => $booking->id,
            'reference'  => $booking->reference,
            'reason'     => $booking->cancellation_reason,
            'refund'     => $booking->refund_amount,
        ]);
    }

    public function notifyBookingCompleted(Booking $booking): void
    {
        $booking->guest->notify(new BookingCompletedNotification($booking));

        $this->pushToSocket('booking.completed', $booking->guest_id, [
            'booking_id'  => $booking->id,
            'reference'   => $booking->reference,
            'can_review'  => true,
        ]);
    }

    public function notifyNewMessage(Message $message): void
    {
        $conversation = $message->conversation()->with('participants')->first();

        foreach ($conversation->participants as $participant) {
            if ($participant->id !== $message->sender_id) {
                $participant->notify(new NewMessageNotification($message));

                $this->pushToSocket('message.new', $participant->id, [
                    'conversation_id' => $conversation->id,
                    'message_id'      => $message->id,
                    'sender_name'     => $message->sender->full_name,
                    'body'            => substr($message->body, 0, 100),
                    'created_at'      => $message->created_at->toISOString(),
                ]);
            }
        }
    }

    private function pushToSocket(string $event, string $userId, array $data): void
    {
        try {
            $redis = app('redis');
            $redis->publish('chamalcom:notifications', json_encode([
                'event'   => $event,
                'user_id' => $userId,
                'data'    => $data,
            ]));
        } catch (\Throwable $e) {
            Log::warning("Socket push failed: {$e->getMessage()}");
        }
    }
}
