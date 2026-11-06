<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Gives a couple the login and the temporary code of their new space.
 *
 * It is not queued on purpose: the code would otherwise be stored in clear in
 * the jobs table.
 */
class TemporaryAccessCodeNotification extends Notification
{
    public function __construct(public string $temporaryCode) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->from(config('mail.from.address'), 'La Dernière Touche')
            ->subject('Votre espace client La Dernière Touche')
            ->view('emails.temporary-access-code', [
                'names' => $notifiable->name,
                'login' => $notifiable->email,
                'temporaryCode' => $this->temporaryCode,
                'loginUrl' => route('login'),
            ]);
    }
}
