<?php

namespace App\Notifications;

use App\Models\Prescription;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Notifies the patient when the doctor issues a prescription.
 * Database + realtime, no mail (bell only).
 */
class PrescriptionIssued extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public Prescription $prescription,
        public string $actorName,
    ) {}

    public static function dispatchFor(Prescription $prescription, User $actor): void
    {
        $prescription->loadMissing(['patient.user', 'consultation.doctor']);

        $patientUser = $prescription->patient?->user;

        if ($patientUser !== null && $patientUser->id !== $actor->id) {
            $patientUser->notify(new self($prescription, $actor->name));
        }
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
        $date = $this->prescription->created_at instanceof \DateTimeInterface
            ? $this->prescription->created_at->format('d/m/Y')
            : (string) $this->prescription->created_at;

        $doctorName = $this->prescription->consultation?->doctor?->name
            ?? $this->actorName;

        return [
            'title' => 'Nueva receta disponible',
            'message' => "{$doctorName} emitió tu receta del {$date}.",
            'url' => '/my-prescriptions',
            'icon' => 'prescription',
            'prescription_id' => $this->prescription->id,
            'actor' => $this->actorName,
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
