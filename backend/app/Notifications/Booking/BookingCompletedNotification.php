<?php

namespace App\Notifications\Booking;

use App\Models\Booking;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class BookingCompletedNotification extends Notification
{
    public function __construct(private readonly Booking $booking) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $b     = $this->booking;
        $isAr  = $notifiable->locale === 'ar';
        $title = $b->property?->title_ar ?? $b->property?->title_fr ?? '';

        return (new MailMessage)
            ->subject($isAr
                ? "⭐ كيف كانت إقامتك؟ — {$b->reference}"
                : "⭐ Comment s'est passé votre séjour ? — {$b->reference}"
            )
            ->greeting($isAr ? "مرحباً {$notifiable->first_name}" : "Bonjour {$notifiable->first_name},")
            ->line($isAr
                ? "نأمل أن إقامتك في **{$title}** كانت رائعة!"
                : "Nous espérons que votre séjour à **{$title}** était excellent !"
            )
            ->line($isAr
                ? 'شاركنا تجربتك بتقييم إقامتك، رأيك يساعد المسافرين الآخرين.'
                : 'Partagez votre expérience en laissant un avis. Votre opinion aide les autres voyageurs.'
            )
            ->action(
                $isAr ? 'تقييم إقامتك' : 'Laisser un avis',
                url("/client/bookings/{$b->id}/review")
            )
            ->line($isAr ? 'شكراً لاختيارك ChamalCom!' : 'Merci d\'avoir choisi ChamalCom !');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'       => 'booking_completed',
            'booking_id' => $this->booking->id,
            'reference'  => $this->booking->reference,
            'can_review' => true,
        ];
    }
}
