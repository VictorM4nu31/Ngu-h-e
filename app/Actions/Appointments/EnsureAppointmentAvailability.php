<?php

namespace App\Actions\Appointments;

use App\Models\Appointment;
use App\Models\DoctorSchedule;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;

class EnsureAppointmentAvailability
{
    /**
     * Reject an appointment that overlaps an existing active one for the same doctor.
     */
    public function noOverlap(int $doctorId, Carbon $start, Carbon $end, ?int $ignoreAppointmentId = null, string $errorField = 'start_time'): void
    {
        $conflict = Appointment::query()
            ->where('doctor_id', $doctorId)
            ->where(fn ($query) => $query
                ->where('start_time', '<', $end)
                ->where('end_time', '>', $start))
            ->whereIn('status', ['scheduled', 'confirmed', 'completed'])
            ->when($ignoreAppointmentId, fn ($query) => $query->whereKeyNot($ignoreAppointmentId))
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                $errorField => 'Este horario ya no está disponible.',
            ]);
        }
    }

    /**
     * Reject an appointment that falls outside the doctor's working schedule.
     */
    public function withinSchedule(int $doctorId, Carbon $start, Carbon $end, string $errorField = 'start_time'): void
    {
        $schedule = DoctorSchedule::query()
            ->where('user_id', $doctorId)
            ->where('day_of_week', $start->dayOfWeek)
            ->first();

        if ($schedule === null || ! $schedule->is_working || ! $schedule->start_time || ! $schedule->end_time) {
            throw ValidationException::withMessages([
                $errorField => 'El médico no atiende en el horario seleccionado.',
            ]);
        }

        $scheduleStart = $start->copy()->setTimeFromTimeString($schedule->start_time);
        $scheduleEnd = $start->copy()->setTimeFromTimeString($schedule->end_time);

        if ($start->lt($scheduleStart) || $end->gt($scheduleEnd)) {
            throw ValidationException::withMessages([
                $errorField => 'El horario seleccionado está fuera del horario de atención.',
            ]);
        }
    }
}
