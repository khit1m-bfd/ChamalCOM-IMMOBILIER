<?php

namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $appName = config('app.name', 'ChamalCom');

        return (new MailMessage)
            ->subject("[$appName] Vérification de votre adresse e-mail / تأكيد بريدك الإلكتروني")
            ->greeting("Bonjour / مرحباً {$notifiable->first_name},")
            ->line('Utilisez le code ci-dessous pour vérifier votre adresse e-mail.')
            ->line('استخدم الرمز أدناه لتأكيد بريدك الإلكتروني.')
            ->line('')
            ->line("**{$this->code}**")
            ->line('')
            ->line('Ce code expire dans 10 minutes. / هذا الرمز صالح لمدة 10 دقائق.')
            ->salutation("L'équipe $appName / فريق $appName");
    }
}
