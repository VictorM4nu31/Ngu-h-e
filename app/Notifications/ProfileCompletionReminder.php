<?php

namespace App\Notifications;

use App\Models\Patient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Weekly nudge for patients whose basic profile data is incomplete.
 * Database + realtime, no mail (bell only).
 */
class ProfileCompletionReminder extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public Patient $patient) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Completa tus datos',
            'message' => 'Completa tu teléfono y dirección en tu perfil para agilizar tu atención.',
            'url' => '/my-profile',
            'icon' => 'profile',
            'patient_id' => $this->patient->id,
        ];
    }

    /**
     * Falls back to the notifiable's private channel (App.Models.User.{id}).
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [];
    }
}
