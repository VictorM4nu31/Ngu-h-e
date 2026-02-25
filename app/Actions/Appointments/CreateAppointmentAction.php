<?php

namespace App\Actions\Appointments;

use App\Models\Appointment;

class CreateAppointmentAction
{
    public function execute(array $data): Appointment
    {
        // Basic conflict detection could be added here later
        return Appointment::create($data);
    }
}
