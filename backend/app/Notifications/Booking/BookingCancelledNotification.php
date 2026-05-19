<?php

namespace App\Notifications\Booking;

use App\Models\Booking;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BookingCancelledNotification extends Notification
{
    public function __construct(private readonly Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $b      = $this->booking;
        $isAr   = $notifiable->locale === 'ar';
        $title  = $b->property?->title_ar ?? $b->property?->title_fr ?? '';
        $refund = (float) $b->refund_amount;

        $mail = (new MailMessage)
            ->subject($isAr
                ? "❌ تم إلغاء الحجز — {$b->reference}"
                : "❌ Réservation annulée — {$b->reference}"
            )
            ->greeting($isAr ? "مرحباً {$notifiable->first_name}" : "Bonjour {$notifiable->first_name},")
            ->line($isAr
                ? "تم إلغاء الحجز رقم **{$b->reference}** في **{$title}**."
                : "La réservation **{$b->reference}** à **{$title}** a été annulée."
            );

        if ($b->cancellation_reason) {
            $mail->line($isAr
                ? "**السبب:** {$b->cancellation_reason}"
                : "**Motif :** {$b->cancellation_reason}"
            );
        }

        if ($refund > 0) {
            $mail->line($isAr
                ? "**مبلغ الاسترداد:** {$refund} {$b->currency} — سيتم تحويله خلال 5-7 أيام عمل."
                : "**Remboursement :** {$refund} {$b->currency} — sera crédité sous 5-7 jours ouvrés."
            );
        }

        return $mail->line($isAr
            ? 'نعتذر عن الإزعاج.'
            : 'Nous nous excusons pour la gêne occasionnée.'
        );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'booking_cancelled',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
            'reason'     => $this->booking->cancellation_reason,
            'refund'     => $this->booking->refund_amount,
        ];
    }
}
