<?php

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;

test('dates are serialized with the application timezone offset', function () {
    $doctor = User::factory()->create();
    $patient = Patient::create([
        'full_name' => 'Paciente fechas',
        'document_id' => 'DT-001',
        'email' => 'dt@test.com',
    ]);

    $appointment = Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => Carbon::create(2026, 8, 28, 11, 0, 0),
        'end_time' => Carbon::create(2026, 8, 28, 11, 30, 0),
        'status' => 'scheduled',
    ]);

    expect($appointment->toArray()['start_time'])
        ->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/');
});
