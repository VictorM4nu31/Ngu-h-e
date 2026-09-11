<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Notifications\AppointmentReminder;
use Illuminate\Console\Command;

class NotifyUpcomingAppointments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:notify-upcoming-appointments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send day-before reminders for tomorrow appointments (once each).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $tomorrow = now()->addDay()->toDateString();

        $appointments = Appointment::with(['patient.user', 'doctor'])
            ->whereDate('start_time', $tomorrow)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->whereNull('reminder_sent_at')
            ->get();

        foreach ($appointments as $appointment) {
            AppointmentReminder::dispatchFor($appointment);
            $appointment->update(['reminder_sent_at' => now()]);
        }

        $this->info("Reminders sent: {$appointments->count()}.");

        return self::SUCCESS;
    }
}
