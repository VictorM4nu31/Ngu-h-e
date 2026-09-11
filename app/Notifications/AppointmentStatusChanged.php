<?php

namespace App\Notifications;

use App\Models\Appointment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Notifies the interested parties when an appointment is created or
 * changes status. Delivered to the database and broadcast in real time
 * over the notifiable's private channel. No mail (bell only).
 */
class AppointmentStatusChanged extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public Appointment $appointment,
        public ?string $oldStatus,
        public string $actorName,
    ) {}

    /**
     * Dispatch to patient and/or doctor, skipping whoever performed
     * the action.
     */
    public static function dispatchFor(Appointment $appointment, ?string $oldStatus, User $actor): void
    {
        // Reload DB defaults (e.g. status on freshly created models).
        $appointment->refresh();
        $appointment->loadMissing(['patient', 'doctor']);

        $notification = new self($appointment, $oldStatus, $actor->name);

        $patientUser = $appointment->patient?->user;
        if ($patientUser !== null && $patientUser->id !== $actor->id) {
            $patientUser->notify($notification);
        }

        $doctor = $appointment->doctor;
        if ($doctor !== null && $doctor->id !== $actor->id) {
            $doctor->notify($notification);
        }
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $status = $this->appointment->status instanceof \BackedEnum
            ? $this->appointment->status->value
            : (string) $this->appointment->status;

        $isNew = $this->oldStatus === null;

        return [
            'title' => $isNew ? 'Nueva cita agendada' : 'Tu cita fue '.$this->statusLabel($status),
            'message' => $isNew
                ? "Cita para {$this->appointment->patient?->full_name} el {$this->appointmentDate()} con {$this->appointment->doctor?->name}."
                : "Tu cita del {$this->appointmentDate()} cambió a {$this->statusLabel($status)}.",
            'url' => $notifiable instanceof User && $notifiable->hasRole('patient')
                ? '/my-appointments'
                : '/appointments',
            'icon' => 'calendar',
            'appointment_id' => $this->appointment->id,
            'status' => $status,
            'actor' => $this->actorName,
        ];
    }

    /**
     * The channels the notification is broadcast on.
     *
     * Returning an empty array lets Laravel fall back to the notifiable's
     * private channel (App.Models.User.{id}), which matches
     * routes/channels.php.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [];
    }

    private function appointmentDate(): string
    {
        return $this->appointment->start_time instanceof \DateTimeInterface
            ? $this->appointment->start_time->format('d/m/Y H:i')
            : (string) $this->appointment->start_time;
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'scheduled' => 'programada',
            'confirmed' => 'confirmada',
            'completed' => 'completada',
            'cancelled' => 'cancelada',
            'no_show' => 'marcada como ausencia',
            default => $status,
        };
    }
}
