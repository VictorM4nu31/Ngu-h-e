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
