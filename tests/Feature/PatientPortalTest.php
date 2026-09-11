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

test('a patient can view their own profile form', function () {
    [$user, $patient] = makePatient('ProfileA');

    $this->withoutVite()->actingAs($user)->get(route('patient.profile'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('patient/profile')
            ->where('patient.id', $patient->id));
});

test('a patient can update their own basic data', function () {
    [$user, $patient] = makePatient('ProfileB');
    [$otherUser, $other] = makePatient('ProfileC');

    $this->actingAs($user)
        ->put(route('patient.profile.update'), [
            'phone' => '5551112233',
            'address' => 'Calle QA 123',
            'birth_date' => '1990-05-15',
            'gender' => 'female',
            'email' => 'new@test.com',
        ])
        ->assertRedirect();

    expect($patient->fresh()->phone)->toBe('5551112233')
        ->and($patient->fresh()->address)->toBe('Calle QA 123')
        // Identity and other records stay untouched.
        ->and($patient->fresh()->full_name)->toBe('ProfileB')
        ->and($other->fresh()->phone)->toBeNull();
});

test('a patient cannot escalate disallowed fields through the profile', function () {
    [$user, $patient] = makePatient('ProfileD');

    $this->actingAs($user)
        ->put(route('patient.profile.update'), [
            'full_name' => 'Hacked Name',
            'document_id' => 'HACK-1',
            'allergies' => 'Hacked',
            'phone' => '5550000000',
        ])
        ->assertRedirect();

    $fresh = $patient->fresh();
    expect($fresh->full_name)->toBe('ProfileD')
        ->and($fresh->document_id)->toBeNull()
        ->and($fresh->allergies)->toBeNull()
        ->and($fresh->phone)->toBe('5550000000');
});

test('profile update validates basic data', function () {
    [$user] = makePatient('ProfileE');

    $this->actingAs($user)
        ->put(route('patient.profile.update'), [
            'email' => 'not-an-email',
            'birth_date' => '2050-01-01',
            'gender' => 'unknown',
        ])
        ->assertSessionHasErrors(['email', 'birth_date', 'gender']);
});

test('staff roles cannot access the patient profile', function () {
    $receptionist = User::factory()->create();
    $receptionist->assignRole('receptionist');

    $this->actingAs($receptionist)->get(route('patient.profile'))->assertForbidden();
    $this->actingAs($receptionist)->put(route('patient.profile.update'), ['phone' => '1'])->assertForbidden();
});
