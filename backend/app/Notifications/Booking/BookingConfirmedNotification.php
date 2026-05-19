<?php

namespace App\Notifications\Booking;

use App\Models\Booking;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BookingConfirmedNotification extends Notification
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

        return (new MailMessage)
            ->subject($isAr
                ? "✅ تم تأكيد حجزك — {$b->reference}"
                : "✅ Réservation confirmée — {$b->reference}"
            )
            ->greeting($isAr ? "مرحباً {$notifiable->first_name}" : "Bonjour {$notifiable->first_name},")
            ->line($isAr
                ? "🎉 تم تأكيد حجزك في **{$title}**!"
                : "🎉 Votre réservation à **{$title}** est confirmée !"
            )
            ->line($isAr
                ? "**الوصول:** {$b->check_in_date->format('d/m/Y')} — **المغادرة:** {$b->check_out_date->format('d/m/Y')}"
                : "**Arrivée :** {$b->check_in_date->format('d/m/Y')} — **Départ :** {$b->check_out_date->format('d/m/Y')}"
            )
            ->line($isAr
                ? "**رقم الحجز:** {$b->reference}"
                : "**Référence :** {$b->reference}"
            )
            ->action(
                $isAr ? 'عرض تفاصيل الحجز' : 'Voir ma réservation',
                url("/client/bookings/{$b->id}")
            )
            ->line($isAr ? 'نتمنى لك إقامة رائعة!' : 'Nous vous souhaitons un excellent séjour !');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'booking_confirmed',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
            'property'   => $this->booking->property?->title_ar,
            'check_in'   => $this->booking->check_in_date?->format('Y-m-d'),
            'check_out'  => $this->booking->check_out_date?->format('Y-m-d'),
        ];
    }
}
