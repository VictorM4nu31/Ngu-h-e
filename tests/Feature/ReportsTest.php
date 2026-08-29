<?php

use App\Models\Patient;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

function reportsAdmin(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

test('reports page returns the expected financial summary shape', function () {
    $admin = reportsAdmin();

    $patient = Patient::create(['full_name' => 'Paciente reporte', 'document_id' => 'REP-001']);
    \App\Models\Payment::create([
        'patient_id' => $patient->id,
        'amount' => 100,
        'payment_method' => 'cash',
        'status' => 'paid',
    ]);
    \App\Models\Payment::create([
        'patient_id' => $patient->id,
        'amount' => 300,
        'payment_method' => 'card',
        'status' => 'paid',
    ]);
    \App\Models\Payment::create([
        'patient_id' => $patient->id,
        'amount' => 50,
        'payment_method' => 'cash',
        'status' => 'pending',
    ]);

    $response = $this->actingAs($admin)->get(route('reports.index'))->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('reports/index')
        ->has('stats')
        ->where('stats.total_revenue_month', 400)
        ->where('stats.pending_amount', 50));
});

test('reports page is forbidden for doctors', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $this->actingAs($doctor)->get(route('reports.index'))->assertForbidden();
});
