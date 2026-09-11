<?php

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

function notificationContext(): array
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $patientUser = User::factory()->create();
    $patientUser->assignRole('patient');
    $patient = Patient::create([
        'user_id' => $patientUser->id,
        'full_name' => 'Paciente Notif',
        'document_id' => 'NOTIF-001',
    ]);

    return [$admin, $doctor, $patientUser, $patient];
}

function makeAppointment(Patient $patient, User $doctor, string $status = 'scheduled'): Appointment
{
    $base = Carbon::tomorrow()->setTime(10, 0);

    return Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => $base,
        'end_time' => $base->copy()->addMinutes(30),
        'status' => $status,
    ]);
}

test('confirming an appointment notifies the patient but not the acting doctor', function () {
    [$admin, $doctor, $patientUser, $patient] = notificationContext();
    $appointment = makeAppointment($patient, $doctor);

    $this->actingAs($doctor)
        ->put(route('appointments.update', $appointment), [
            'status' => 'confirmed',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('notifications', [
        'notifiable_id' => $patientUser->id,
    ]);

    $notification = $patientUser->notifications()->latest()->first();
    expect($notification->data['status'])->toBe('confirmed')
        ->and($notification->data['url'])->toBe('/my-appointments')
        ->and($doctor->notifications()->count())->toBe(0);
});

test('staff booking notifies the doctor with the staff URL', function () {
    [$admin, $doctor, $patientUser, $patient] = notificationContext();

    $this->actingAs($admin)
        ->post(route('appointments.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'start_time' => Carbon::tomorrow()->setTime(11, 0)->format('Y-m-d H:i'),
            'end_time' => Carbon::tomorrow()->setTime(11, 30)->format('Y-m-d H:i'),
        ])
        ->assertRedirect();

    $notification = $doctor->notifications()->latest()->first();
    expect($notification)->not->toBeNull()
        ->and($notification->data['url'])->toBe('/appointments')
        ->and($notification->data['status'])->toBe('scheduled');
});

test('a patient cannot mark another user notification as read', function () {
    [$admin, $doctor, $patientUser, $patient] = notificationContext();
    $appointment = makeAppointment($patient, $doctor);

    $this->actingAs($doctor)
        ->put(route('appointments.update', $appointment), ['status' => 'cancelled'])
        ->assertRedirect();

    $notificationId = $patientUser->notifications()->latest()->first()->id;

    // Admin has no notifications; attempting to mark the patient's one fails.
    $this->actingAs($admin)->post(route('notifications.read', $notificationId))->assertNotFound();

    expect($patientUser->notifications()->whereNull('read_at')->count())->toBe(1);
});

test('notifications index props expose the bell data', function () {
    [$admin, $doctor, $patientUser, $patient] = notificationContext();
    $appointment = makeAppointment($patient, $doctor);

    $this->actingAs($doctor)
        ->put(route('appointments.update', $appointment), ['status' => 'confirmed'])
        ->assertRedirect();

    $this->withoutVite()->actingAs($patientUser)->get(route('patient.appointments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('unreadCount', 1)
            ->has('notifications', 1));
});
