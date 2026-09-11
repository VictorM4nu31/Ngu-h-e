<?php

namespace App\Notifications;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Notification;

/**
 * Notifies the patient and the front-desk staff when a payment is
 * registered. Database + realtime, no mail (bell only).
 */
class PaymentRegistered extends Notification implements ShouldBroadcast
{
    use Queueable;

    public function __construct(
        public Payment $payment,
        public string $actorName,
    ) {}

    public static function dispatchFor(Payment $payment, User $actor): void
    {
        $payment->loadMissing(['patient.user']);

        $recipients = collect();

        $patientUser = $payment->patient?->user;
        if ($patientUser !== null) {
            $recipients->push($patientUser);
        }

        $staff = User::role(['admin', 'receptionist'])->get();
        foreach ($staff as $member) {
            $recipients->push($member);
        }

        $recipients->unique('id')
            ->reject(fn (User $user) => $user->id === $actor->id)
            ->each(fn (User $user) => $user->notify(new self($payment, $actor->name)));
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
        $amount = number_format((float) $this->payment->amount, 2);
        $patientName = $this->payment->patient?->full_name ?? '';

        $isPatient = $notifiable instanceof User && $notifiable->hasRole('patient');

        return [
            'title' => 'Pago registrado',
            'message' => $isPatient
                ? "Se registró tu pago de \${$amount}."
                : "Pago de \${$amount} de {$patientName} registrado por {$this->actorName}.",
            'url' => $isPatient ? '/dashboard' : '/payments',
            'icon' => 'payment',
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
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
