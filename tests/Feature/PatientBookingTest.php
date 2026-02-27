<?php

use App\Models\User;
use App\Models\Patient;
use App\Models\Appointment;
use Spatie\Permission\Models\Role;
use Carbon\Carbon;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'doctor']);
    Role::firstOrCreate(['name' => 'patient']);
});

test('patient can view availability slots', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient_user = User::factory()->create();
    $patient_user->assignRole('patient');
    Patient::create([
        'user_id' => $patient_user->id,
        'full_name' => 'Test Patient',
        'email' => 'patient@test.com',
        'document_id' => '12345678',
    ]);

    $date = now()->addDay()->format('Y-m-d');
    $dayOfWeek = now()->addDay()->dayOfWeek;

    // Crear el horario para que tenga disponibilidad
    \App\Models\DoctorSchedule::create([
        'user_id' => $doctor->id,
        'day_of_week' => $dayOfWeek,
        'is_working' => true,
        'start_time' => '08:00:00',
        'end_time' => '18:00:00',
    ]);

    $response = $this->actingAs($patient_user)
        ->get(route('api.availability', [
            'doctor_id' => $doctor->id,
            'date' => $date
        ]));

    $response->assertOk();
    $response->assertJsonStructure(['slots']);
    
    // Debería haber un slot de las 09:00
    $response->assertJsonFragment(['time' => '09:00', 'available' => true]);
});

test('patient can book a free appointment slot', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient_user = User::factory()->create();
    $patient_user->assignRole('patient');
    $patient = Patient::create([
        'user_id' => $patient_user->id,
        'full_name' => 'Test Patient',
        'email' => 'patient@test.com',
        'document_id' => '12345678',
    ]);

    $date = now()->addDay()->format('Y-m-d');
    $time = '10:00';
    $dayOfWeek = now()->addDay()->dayOfWeek;

    // Crear el horario
    \App\Models\DoctorSchedule::create([
        'user_id' => $doctor->id,
        'day_of_week' => $dayOfWeek,
        'is_working' => true,
        'start_time' => '08:00:00',
        'end_time' => '18:00:00',
    ]);

    $response = $this->actingAs($patient_user)
        ->post(route('patient.appointments.store'), [
            'doctor_id' => $doctor->id,
            'date' => $date,
            'time' => $time,
            'reason' => 'Consulta de prueba'
        ]);

    $response->assertRedirect(route('patient.appointments'));
    $this->assertDatabaseHas('appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'reason' => 'Consulta de prueba',
        'status' => 'scheduled'
    ]);
});

test('patient cannot book an occupied slot', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient_user = User::factory()->create();
    $patient_user->assignRole('patient');
    Patient::create([
        'user_id' => $patient_user->id,
        'full_name' => 'Patient 1',
        'email' => 'p1@test.com',
        'document_id' => '1',
    ]);

    $date = now()->addDay()->format('Y-m-d');
    $time = '11:00';
    $start = Carbon::createFromFormat('Y-m-d H:i', "$date $time");
    $end = $start->copy()->addMinutes(30);

    // Crear cita previa
    Appointment::create([
        'patient_id' => Patient::first()->id,
        'doctor_id' => $doctor->id,
        'start_time' => $start,
        'end_time' => $end,
        'status' => 'confirmed'
    ]);

    $dayOfWeek = now()->addDay()->dayOfWeek;
    // Crear el horario
    \App\Models\DoctorSchedule::create([
        'user_id' => $doctor->id,
        'day_of_week' => $dayOfWeek,
        'is_working' => true,
        'start_time' => '08:00:00',
        'end_time' => '18:00:00',
    ]);

    // Intentar agendar en el mismo horario
    $response = $this->actingAs($patient_user)
        ->post(route('patient.appointments.store'), [
            'doctor_id' => $doctor->id,
            'date' => $date,
            'time' => $time,
            'reason' => 'Intento fallido'
        ]);

    $response->assertSessionHasErrors(['time']);
    $this->assertDatabaseMissing('appointments', [
        'reason' => 'Intento fallido'
    ]);
});

test('patient cannot book a slot in the past', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient_user = User::factory()->create();
    $patient_user->assignRole('patient');
    Patient::create([
        'user_id' => $patient_user->id,
        'full_name' => 'Patient 1',
        'email' => 'p1@test.com',
        'document_id' => '1',
    ]);

    // Usar ayer
    $date = now()->subDay()->format('Y-m-d');
    $dayOfWeek = now()->subDay()->dayOfWeek;
    $time = '10:00';

    // Crear el horario
    \App\Models\DoctorSchedule::create([
        'user_id' => $doctor->id,
        'day_of_week' => $dayOfWeek,
        'is_working' => true,
        'start_time' => '08:00:00',
        'end_time' => '18:00:00',
    ]);

    $response = $this->actingAs($patient_user)
        ->get(route('api.availability', [
            'doctor_id' => $doctor->id,
            'date' => $date
        ]));

    // Los slots antiguos deben estar marcados como NO disponibles
    $slots = $response->json('slots');
    foreach ($slots as $slot) {
        $this->assertFalse($slot['available']);
    }
});
