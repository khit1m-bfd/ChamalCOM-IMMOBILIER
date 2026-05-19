<?php

namespace App\Notifications\Message;

use App\Models\Message;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class NewMessageNotification extends Notification
{
    public function __construct(private readonly Message $message) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $msg   = $this->message;
        $isAr  = $notifiable->locale === 'ar';
        $sender = $msg->sender?->full_name ?? '';
        $preview = mb_substr($msg->body, 0, 120) . (mb_strlen($msg->body) > 120 ? '...' : '');

        return (new MailMessage)
            ->subject($isAr
                ? "💬 رسالة جديدة من {$sender}"
                : "💬 Nouveau message de {$sender}"
            )
            ->greeting($isAr ? "مرحباً {$notifiable->first_name}" : "Bonjour {$notifiable->first_name},")
            ->line($isAr
                ? "لديك رسالة جديدة من **{$sender}** :"
                : "Vous avez un nouveau message de **{$sender}** :"
            )
            ->line("\"{$preview}\"")
            ->action(
                $isAr ? 'قراءة الرسالة' : 'Lire le message',
                url('/messages')
            );
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'            => 'new_message',
            'message_id'      => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_name'     => $this->message->sender?->full_name,
            'preview'         => mb_substr($this->message->body, 0, 80),
        ];
    }
}
