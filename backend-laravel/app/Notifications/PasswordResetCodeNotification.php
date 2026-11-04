<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordResetCodeNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('TrackEd password reset code')
            ->greeting('Password reset requested')
            ->line("Your TrackEd verification code is: {$this->code}")
            ->line('This code expires in 10 minutes and can only be used once.')
            ->line('If you did not request a password reset, you can ignore this email.');
    }
}
