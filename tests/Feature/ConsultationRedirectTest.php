<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

test('consultation create redirects if no patient_id is provided', function () {
    $doctor = tap(User::factory()->create(), function ($user) {
        $user->assignRole('doctor');
    });

    $response = $this->actingAs($doctor)->get(route('consultations.create'));

    $response->assertRedirect(route('patients.index'));
    $response->assertSessionHas('error');
});
