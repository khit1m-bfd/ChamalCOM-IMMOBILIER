<?php

namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetNotification extends Notification
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
            ->subject("[$appName] Réinitialisation de mot de passe / إعادة تعيين كلمة المرور")
            ->greeting("Bonjour / مرحباً {$notifiable->first_name},")
            ->line('Vous avez demandé une réinitialisation de mot de passe.')
            ->line('لقد طلبت إعادة تعيين كلمة المرور.')
            ->line('')
            ->line("**{$this->code}**")
            ->line('')
            ->line('Ce code expire dans 10 minutes. / هذا الرمز صالح لمدة 10 دقائق.')
            ->line("Si vous n'avez pas fait cette demande, ignorez cet e-mail.")
            ->line('إذا لم تطلب ذلك، يمكنك تجاهل هذا البريد.')
            ->salutation("L'équipe $appName / فريق $appName");
    }
}
