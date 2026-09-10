<?php

use App\Models\Patient;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

test('staff can update a patient keeping the same document id', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $patient = Patient::create([
        'full_name' => 'Paciente Update',
        'document_id' => 'UPD-001',
    ]);

    $this->actingAs($admin)
        ->put(route('patients.update', $patient), [
            'full_name' => 'Paciente Update',
            'document_id' => 'UPD-001',
            'phone' => '5559998877',
        ])
        ->assertRedirect();

    expect($patient->fresh()->phone)->toBe('5559998877');
});

test('patient update rejects a document id taken by another patient', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin');

    Patient::create(['full_name' => 'Otro', 'document_id' => 'UPD-002']);
    $patient = Patient::create(['full_name' => 'Paciente Update', 'document_id' => 'UPD-003']);

    $this->actingAs($admin)
        ->put(route('patients.update', $patient), [
            'full_name' => 'Paciente Update',
            'document_id' => 'UPD-002',
        ])
        ->assertSessionHasErrors(['document_id']);

    expect($patient->fresh()->document_id)->toBe('UPD-003');
});
