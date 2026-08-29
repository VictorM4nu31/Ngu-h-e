<?php

use App\Models\Appointment;
use App\Models\Attachment;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

function roleUser(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

test('only admins can delete patients', function () {
    $patient = Patient::create(['full_name' => 'Paciente P', 'document_id' => 'POL-1']);

    expect(roleUser('admin')->can('delete', $patient))->toBeTrue();
    expect(roleUser('doctor')->can('delete', $patient))->toBeFalse();
    expect(roleUser('receptionist')->can('delete', $patient))->toBeFalse();
    expect(roleUser('patient')->can('delete', $patient))->toBeFalse();
});

test('staff can create and update patients', function () {
    expect(roleUser('admin')->can('create', Patient::class))->toBeTrue();
    expect(roleUser('doctor')->can('create', Patient::class))->toBeTrue();
    expect(roleUser('receptionist')->can('create', Patient::class))->toBeTrue();
    expect(roleUser('patient')->can('create', Patient::class))->toBeFalse();
});

test('a doctor only views their own consultations', function () {
    $doctor = roleUser('doctor');
    $otherDoctor = roleUser('doctor');
    $patient = Patient::create(['full_name' => 'Paciente C', 'document_id' => 'POL-2']);

    $own = Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'reason_for_visit' => 'razon',
        'diagnosis' => 'diagnostico',
    ]);
    $other = Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $otherDoctor->id,
        'reason_for_visit' => 'razon',
        'diagnosis' => 'diagnostico',
    ]);

    expect($doctor->can('view', $own))->toBeTrue();
    expect($doctor->can('view', $other))->toBeFalse();
    expect(roleUser('admin')->can('view', $other))->toBeTrue();
});

test('a patient only views their own prescription', function () {
    $doctor = roleUser('doctor');
    $patientA = roleUser('patient');
    $patientB = roleUser('patient');

    $pa = Patient::create(['user_id' => $patientA->id, 'full_name' => 'A', 'document_id' => 'POL-3']);
    $pb = Patient::create(['user_id' => $patientB->id, 'full_name' => 'B', 'document_id' => 'POL-4']);

    $consultation = Consultation::create([
        'patient_id' => $pa->id,
        'doctor_id' => $doctor->id,
        'reason_for_visit' => 'razon',
        'diagnosis' => 'diagnostico',
    ]);

    $prescription = Prescription::create([
        'consultation_id' => $consultation->id,
        'patient_id' => $pa->id,
        'doctor_id' => $doctor->id,
        'items' => [['medication' => 'X', 'dosage' => '1mg']],
    ]);

    expect($patientA->can('view', $prescription))->toBeTrue();
    expect($patientB->can('view', $prescription))->toBeFalse();
    expect($doctor->can('view', $prescription))->toBeTrue();
    expect(roleUser('receptionist')->can('view', $prescription))->toBeTrue();
});

test('a doctor only manages their own appointments', function () {
    $doctor = roleUser('doctor');
    $otherDoctor = roleUser('doctor');
    $patient = Patient::create(['full_name' => 'Paciente A', 'document_id' => 'POL-5']);

    $appointment = Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => now()->addDay(),
        'end_time' => now()->addDay()->addMinutes(30),
        'status' => 'scheduled',
    ]);
    $other = Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $otherDoctor->id,
        'start_time' => now()->addDay(),
        'end_time' => now()->addDay()->addMinutes(30),
        'status' => 'scheduled',
    ]);

    expect($doctor->can('update', $appointment))->toBeTrue();
    expect($doctor->can('delete', $appointment))->toBeTrue();
    expect($doctor->can('update', $other))->toBeFalse();
    expect($doctor->can('delete', $other))->toBeFalse();

    expect(roleUser('admin')->can('delete', $other))->toBeTrue();
    expect(roleUser('receptionist')->can('update', $other))->toBeTrue();
});

test('only staff can manage attachments', function () {
    expect(roleUser('admin')->can('create', Attachment::class))->toBeTrue();
    expect(roleUser('doctor')->can('create', Attachment::class))->toBeTrue();
    expect(roleUser('receptionist')->can('create', Attachment::class))->toBeTrue();
    expect(roleUser('patient')->can('create', Attachment::class))->toBeFalse();
});
