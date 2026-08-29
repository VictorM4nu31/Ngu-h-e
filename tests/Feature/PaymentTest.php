<?php

use App\Models\Patient;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'receptionist', 'doctor', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

function paymentUser(string $email): User
{
    $user = User::factory()->create(['email' => $email]);
    $user->assignRole('receptionist');

    return $user;
}

test('staff can register a payment', function () {
    $receptionist = paymentUser('pay@ngu.com');
    $patient = Patient::create([
        'full_name' => 'Paciente de pago',
        'document_id' => 'PAY-001',
    ]);

    $this->actingAs($receptionist)
        ->post(route('payments.store'), [
            'patient_id' => $patient->id,
            'amount' => 250.50,
            'payment_method' => 'cash',
            'status' => 'paid',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('payments', [
        'patient_id' => $patient->id,
        'amount' => 250.50,
        'payment_method' => 'cash',
        'status' => 'paid',
    ]);
});

test('staff cannot register a payment with an invalid method', function () {
    $receptionist = paymentUser('pay2@ngu.com');
    $patient = Patient::create(['full_name' => 'Paciente pago', 'document_id' => 'PAY-002']);

    $this->actingAs($receptionist)
        ->post(route('payments.store'), [
            'patient_id' => $patient->id,
            'amount' => 100,
            'payment_method' => 'bitcoin',
            'status' => 'paid',
        ])
        ->assertSessionHasErrors(['payment_method']);
});

test('payments index filters by patient name', function () {
    $receptionist = paymentUser('pay3@ngu.com');

    $patient = Patient::create(['full_name' => 'Ana Perez', 'document_id' => 'PAY-003']);
    $patient2 = Patient::create(['full_name' => 'Luis Gomez', 'document_id' => 'PAY-004']);

    \App\Models\Payment::create(['patient_id' => $patient->id, 'amount' => 50, 'payment_method' => 'cash', 'status' => 'paid']);
    \App\Models\Payment::create(['patient_id' => $patient2->id, 'amount' => 80, 'payment_method' => 'card', 'status' => 'pending']);

    $response = $this->actingAs($receptionist)
        ->get(route('payments.index', ['search' => 'Ana']))
        ->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('payments/index')
        ->has('payments.data', 1));
});
