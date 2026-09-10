<?php

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'doctor']);
});

test('admin can view the consultations index', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $response = $this->withoutVite()->actingAs($admin)->get(route('consultations.index'));

    $response->assertSuccessful();
});

test('doctor only sees their own consultations', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $otherDoctor = User::factory()->create();
    $otherDoctor->assignRole('doctor');
    $patient = Patient::create([
        'full_name' => 'Paciente de prueba',
        'document_id' => 'CONS-001',
    ]);

    Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'reason_for_visit' => 'Consulta propia',
        'diagnosis' => 'Diagnóstico propio',
    ]);
    Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $otherDoctor->id,
        'reason_for_visit' => 'Consulta ajena',
        'diagnosis' => 'Diagnóstico ajeno',
    ]);

    $response = $this->withoutVite()->actingAs($doctor)->get(route('consultations.index'));

    $response->assertInertia(fn (Assert $page) => $page
        ->component('consultations/index')
        ->has('consultations.data', 1)
        ->where('consultations.data.0.doctor_id', $doctor->id)
    );
});

test('consultations do not expose unsupported resource actions', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->actingAs($admin)->get('/consultations/1/edit')->assertNotFound();
});

test('admin creates a consultation attributed to the selected doctor', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $patient = Patient::create(['full_name' => 'Paciente BUG3', 'document_id' => 'BUG3-001']);

    $this->actingAs($admin)
        ->post(route('consultations.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'reason_for_visit' => 'Chequeo',
            'diagnosis' => 'Sano',
        ])
        ->assertRedirect(route('patients.show', $patient->id));

    $consultation = Consultation::latest('id')->first();
    expect((int) $consultation->doctor_id)->toBe($doctor->id);
});

test('admin cannot attribute a consultation to a non-doctor', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $patient = Patient::create(['full_name' => 'Paciente BUG3b', 'document_id' => 'BUG3-002']);

    $this->actingAs($admin)
        ->post(route('consultations.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $admin->id,
            'reason_for_visit' => 'Chequeo',
            'diagnosis' => 'Sano',
        ])
        ->assertSessionHasErrors(['doctor_id']);

    expect(Consultation::count())->toBe(0);
});

test('doctor consultations are always attributed to themselves', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $other = User::factory()->create();
    $other->assignRole('doctor');
    $patient = Patient::create(['full_name' => 'Paciente BUG3c', 'document_id' => 'BUG3-003']);

    $this->actingAs($doctor)
        ->post(route('consultations.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $other->id,
            'reason_for_visit' => 'Chequeo',
            'diagnosis' => 'Sano',
        ])
        ->assertRedirect(route('patients.show', $patient->id));

    expect((int) Consultation::latest('id')->first()->doctor_id)->toBe($doctor->id);
});
