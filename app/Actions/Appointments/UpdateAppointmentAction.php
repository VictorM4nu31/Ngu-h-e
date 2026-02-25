<?php

namespace App\Actions\Appointments;

use App\Models\Appointment;

class UpdateAppointmentAction
{
    public function execute(Appointment $appointment, array $data): Appointment
    {
        $appointment->update($data);
        return $appointment;
    }
}
