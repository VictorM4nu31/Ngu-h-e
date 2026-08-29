<?php

namespace App\Actions\Appointments;

use App\Models\Appointment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class CreateAppointmentAction
{
    public function __construct(private EnsureAppointmentAvailability $availability) {}

    public function execute(array $data): Appointment
    {
        $doctorId = (int) $data['doctor_id'];
        $start = Carbon::parse($data['start_time']);
        $end = Carbon::parse($data['end_time']);

        return DB::transaction(function () use ($data, $doctorId, $start, $end) {
            // Lock the doctor's appointments in range to guard against concurrent double-booking.
            Appointment::query()
                ->where('doctor_id', $doctorId)
                ->where('start_time', '<', $end)
                ->where('end_time', '>', $start)
                ->lockForUpdate()
                ->get();

            $this->availability->noOverlap($doctorId, $start, $end);

            return Appointment::create($data);
        });
    }
}
