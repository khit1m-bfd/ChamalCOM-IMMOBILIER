<?php

namespace App\Notifications\Booking;

use App\Models\Booking;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BookingCreatedNotification extends Notification
{
    public function __construct(private readonly Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $b       = $this->booking;
        $guest   = $b->guest;
        $isAr    = $notifiable->locale === 'ar';
        $refUrl  = url("/owner/bookings");

        return (new MailMessage)
            ->subject($isAr
                ? "🏠 طلب حجز جديد — {$b->reference}"
                : "🏠 Nouvelle demande de réservation — {$b->reference}"
            )
            ->greeting($isAr ? "مرحباً {$notifiable->first_name}" : "Bonjour {$notifiable->first_name},")
            ->line($isAr
                ? "تلقيت طلب حجز جديد من **{$guest?->full_name}**."
                : "Vous avez reçu une nouvelle demande de réservation de **{$guest?->full_name}**."
            )
            ->line($isAr
                ? "**الوصول:** {$b->check_in_date->format('d/m/Y')} — **المغادرة:** {$b->check_out_date->format('d/m/Y')} ({$b->nights_count} " . ($isAr ? 'ليالٍ' : 'nuits') . ")"
                : "**Arrivée :** {$b->check_in_date->format('d/m/Y')} — **Départ :** {$b->check_out_date->format('d/m/Y')} ({$b->nights_count} nuits)"
            )
            ->line($isAr
                ? "**المبلغ الإجمالي:** {$b->total_amount} {$b->currency}"
                : "**Montant total :** {$b->total_amount} {$b->currency}"
            )
            ->action(
                $isAr ? 'عرض الطلب' : 'Voir la demande',
                $refUrl
            )
            ->line($isAr
                ? 'يرجى الرد في أقرب وقت ممكن.'
                : 'Veuillez répondre dans les plus brefs délais.'
            );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'booking_created',
            'booking_id'  => $this->booking->id,
            'reference'   => $this->booking->reference,
            'guest_name'  => $this->booking->guest?->full_name,
            'check_in'    => $this->booking->check_in_date?->format('Y-m-d'),
            'check_out'   => $this->booking->check_out_date?->format('Y-m-d'),
            'total'       => $this->booking->total_amount,
        ];
    }
}
