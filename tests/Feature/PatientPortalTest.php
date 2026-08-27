<?php

use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'doctor']);
    Role::firstOrCreate(['name' => 'patient']);
    Role::firstOrCreate(['name' => 'receptionist']);

    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $this->doctor = $doctor;
});

function makePatient(string $name): array
{
    $user = User::factory()->create();
    $user->assignRole('patient');
    $patient = Patient::create([
        'user_id' => $user->id,
        'full_name' => $name,
        'email' => "$name@test.com",
    ]);

    return [$user, $patient];
}

function makePrescriptionFor(Patient $patient, User $doctor): Prescription
{
    $consultation = Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'reason_for_visit' => 'Control',
        'diagnosis' => 'Diagnóstico',
    ]);

    return Prescription::create([
        'consultation_id' => $consultation->id,
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'items' => [['medication' => 'Ibuprofeno', 'dosage' => '400mg']],
    ]);
}

test('a patient only sees their own appointments', function () {
    [$userA, $patientA] = makePatient('PatientA');
    [$userB, $patientB] = makePatient('PatientB');

    Appointment::create([
        'patient_id' => $patientB->id,
        'doctor_id' => $this->doctor->id,
        'start_time' => Carbon::tomorrow()->setTime(9, 0),
        'end_time' => Carbon::tomorrow()->setTime(9, 30),
        'status' => 'confirmed',
    ]);

    $this->actingAs($userA)
        ->get(route('patient.appointments'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patient/my-appointments')
            ->has('appointments.data', 0));
});

test('a patient cannot download another patient prescription', function () {
    [$userA] = makePatient('PatientA');
    [, $patientB] = makePatient('PatientB');

    $prescription = makePrescriptionFor($patientB, $this->doctor);

    $this->actingAs($userA)
        ->get(route('prescriptions.preview', $prescription))
        ->assertForbidden();
});

test('a patient can preview their own prescription', function () {
    [$userA, $patientA] = makePatient('PatientA');

    $prescription = makePrescriptionFor($patientA, $this->doctor);

    $this->actingAs($userA)
        ->get(route('prescriptions.preview', $prescription))
        ->assertOk();
});

test('a patient without a patient profile still loads the portal', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get(route('patient.appointments'))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('patient.prescriptions'))
        ->assertOk();
});
