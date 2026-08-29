<?php

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'doctor']);
    Role::firstOrCreate(['name' => 'patient']);
});

function makeStaffContext(): array
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient = Patient::create([
        'full_name' => 'Paciente agenda staff',
        'document_id' => 'STF-001',
        'email' => 'staff@test.com',
    ]);

    return [$admin, $doctor, $patient];
}

test('staff cannot create an appointment that overlaps an active one', function () {
    [$admin, $doctor, $patient] = makeStaffContext();

    $base = Carbon::tomorrow()->setTime(10, 0);
    $existing = $base->format('Y-m-d H:i');

    Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => $base,
        'end_time' => $base->copy()->addMinutes(30),
        'status' => 'confirmed',
    ]);

    $this->actingAs($admin)
        ->post(route('appointments.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'start_time' => $existing,
            'end_time' => $base->copy()->addMinutes(30)->format('Y-m-d H:i'),
        ])
        ->assertSessionHasErrors(['start_time']);
});

test('staff can book a slot previously cancelled', function () {
    [$admin, $doctor, $patient] = makeStaffContext();

    $base = Carbon::tomorrow()->setTime(11, 0);

    Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => $base,
        'end_time' => $base->copy()->addMinutes(30),
        'status' => 'cancelled',
    ]);

    $this->actingAs($admin)
        ->post(route('appointments.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'start_time' => $base->format('Y-m-d H:i'),
            'end_time' => $base->copy()->addMinutes(30)->format('Y-m-d H:i'),
        ])
        ->assertRedirect(route('appointments.index'));

    $this->assertDatabaseHas('appointments', [
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'status' => 'scheduled',
        'start_time' => $base->format('Y-m-d H:i:00'),
    ]);
});

test('staff cannot move an appointment onto a conflicting time', function () {
    [$admin, $doctor, $patient] = makeStaffContext();

    $conflictStart = Carbon::tomorrow()->setTime(12, 0);

    $appointment = Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => Carbon::tomorrow()->setTime(9, 0),
        'end_time' => Carbon::tomorrow()->setTime(9, 30),
        'status' => 'scheduled',
    ]);

    Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => $conflictStart,
        'end_time' => $conflictStart->copy()->addMinutes(30),
        'status' => 'confirmed',
    ]);

    $this->actingAs($admin)
        ->put(route('appointments.update', $appointment), [
            'start_time' => $conflictStart->format('Y-m-d H:i'),
            'end_time' => $conflictStart->copy()->addMinutes(30)->format('Y-m-d H:i'),
        ])
        ->assertSessionHasErrors(['start_time']);
});

test('staff cannot be assigned as doctor if the user lacks the doctor role', function () {
    [$admin, , $patient] = makeStaffContext();

    $nonDoctor = User::factory()->create();
    $nonDoctor->assignRole('patient');

    $start = Carbon::tomorrow()->setTime(9, 0);

    $this->actingAs($admin)
        ->post(route('appointments.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $nonDoctor->id,
            'start_time' => $start->format('Y-m-d H:i'),
            'end_time' => $start->copy()->addMinutes(30)->format('Y-m-d H:i'),
        ])
        ->assertSessionHasErrors(['doctor_id']);
});

test('an owner can edit an appointment', function () {
    [$admin, $doctor, $patient] = makeStaffContext();

    $start = Carbon::tomorrow()->setTime(10, 0);
    $appointment = Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => $start,
        'end_time' => $start->copy()->addMinutes(30),
        'status' => 'scheduled',
    ]);

    $this->actingAs($admin)
        ->get(route('appointments.edit', $appointment))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('appointments/edit'));

    $this->actingAs($admin)
        ->put(route('appointments.update', $appointment), [
            'start_time' => $start->format('Y-m-d H:i'),
            'end_time' => $start->copy()->addMinutes(30)->format('Y-m-d H:i'),
            'reason' => 'Motivo actualizado',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('appointments', [
        'id' => $appointment->id,
        'reason' => 'Motivo actualizado',
    ]);
});
