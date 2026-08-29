<?php

namespace App\Actions\Appointments;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UpdateAppointmentAction
{
    public function __construct(private EnsureAppointmentAvailability $availability) {}

    public function execute(Appointment $appointment, array $data): Appointment
    {
        $doctorId = (int) $appointment->doctor_id;
        $start = Carbon::parse($data['start_time'] ?? $appointment->start_time);
        $end = Carbon::parse($data['end_time'] ?? $appointment->end_time);

        return DB::transaction(function () use ($appointment, $data, $doctorId, $start, $end) {
            // Lock the doctor's appointments in range (excluding the current one) to prevent overlaps.
            Appointment::query()
                ->where('doctor_id', $doctorId)
                ->where('start_time', '<', $end)
                ->where('end_time', '>', $start)
                ->whereKeyNot($appointment->id)
                ->lockForUpdate()
                ->get();

            $this->availability->noOverlap($doctorId, $start, $end, $appointment->id);

            $appointment->update($data);

            return $appointment;
        });
    }
}
