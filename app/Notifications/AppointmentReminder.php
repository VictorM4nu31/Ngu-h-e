<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Day-before reminder for an upcoming appointment. Sent to the patient
 * and to the doctor. Database + realtime, no mail (bell only).
 */
class AppointmentReminder extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(public Appointment $appointment) {}

    public static function dispatchFor(Appointment $appointment): void
    {
        $appointment->loadMissing(['patient.user', 'doctor']);

        $recipients = collect();
        if ($appointment->patient?->user !== null) {
            $recipients->push($appointment->patient->user);
        }
        if ($appointment->doctor !== null) {
            $recipients->push($appointment->doctor);
        }

        $recipients->unique('id')
            ->each(fn (User $user) => $user->notify(new self($appointment)));
    }

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
        $date = $this->appointment->start_time instanceof \DateTimeInterface
            ? $this->appointment->start_time->format('d/m/Y H:i')
            : (string) $this->appointment->start_time;

        $isPatient = $notifiable instanceof User && $notifiable->hasRole('patient');

        return [
            'title' => 'Recordatorio de cita',
            'message' => $isPatient
                ? "Tienes cita mañana {$date} con {$this->appointment->doctor?->name}."
                : "Cita mañana {$date}: {$this->appointment->patient?->full_name}.",
            'url' => $isPatient ? '/my-appointments' : '/appointments',
            'icon' => 'reminder',
            'appointment_id' => $this->appointment->id,
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
