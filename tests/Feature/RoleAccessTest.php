<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Ensure roles exist
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'doctor']);
    Role::firstOrCreate(['name' => 'receptionist']);
    Role::firstOrCreate(['name' => 'patient']);
});

// ═══ Patient should NOT access staff routes ═══

test('patient cannot access patients list', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/patients')
        ->assertStatus(403);
});

test('patient cannot access payments', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/payments')
        ->assertStatus(403);
});

test('patient cannot access reports', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/reports')
        ->assertStatus(403);
});

test('patient cannot create consultations', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/consultations/create')
        ->assertStatus(403);
});

test('patient cannot access staff management', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/staff')
        ->assertStatus(403);
});

// ═══ Doctor restrictions ═══

test('doctor cannot access payments', function () {
    $user = User::factory()->create();
    $user->assignRole('doctor');

    $this->actingAs($user)
        ->get('/payments')
        ->assertStatus(403);
});

test('doctor cannot access reports', function () {
    $user = User::factory()->create();
    $user->assignRole('doctor');

    $this->actingAs($user)
        ->get('/reports')
        ->assertStatus(403);
});

test('doctor cannot access staff management', function () {
    $user = User::factory()->create();
    $user->assignRole('doctor');

    $this->actingAs($user)
        ->get('/staff')
        ->assertStatus(403);
});

// ═══ Receptionist restrictions ═══

test('receptionist cannot access reports', function () {
    $user = User::factory()->create();
    $user->assignRole('receptionist');

    $this->actingAs($user)
        ->get('/reports')
        ->assertStatus(403);
});

test('receptionist cannot access staff management', function () {
    $user = User::factory()->create();
    $user->assignRole('receptionist');

    $this->actingAs($user)
        ->get('/staff')
        ->assertStatus(403);
});

test('receptionist cannot create consultations', function () {
    $user = User::factory()->create();
    $user->assignRole('receptionist');

    $this->actingAs($user)
        ->get('/consultations/create')
        ->assertStatus(403);
});

// ═══ Admin has full access ═══

test('admin can access patients', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/patients')
        ->assertOk();
});

test('admin can access payments', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/payments')
        ->assertOk();
});

test('admin can access reports', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/reports')
        ->assertOk();
});

test('admin can access staff', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get('/staff')
        ->assertOk();
});

// ═══ Positive access tests ═══

test('doctor can access patients', function () {
    $user = User::factory()->create();
    $user->assignRole('doctor');

    $this->actingAs($user)
        ->get('/patients')
        ->assertOk();
});

test('receptionist can access patients', function () {
    $user = User::factory()->create();
    $user->assignRole('receptionist');

    $this->actingAs($user)
        ->get('/patients')
        ->assertOk();
});

test('receptionist can access payments', function () {
    $user = User::factory()->create();
    $user->assignRole('receptionist');

    $this->actingAs($user)
        ->get('/payments')
        ->assertOk();
});

// ═══ Patient portal access ═══

test('patient can access my-appointments', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/my-appointments')
        ->assertOk();
});

test('patient can access my-prescriptions', function () {
    $user = User::factory()->create();
    $user->assignRole('patient');

    $this->actingAs($user)
        ->get('/my-prescriptions')
        ->assertOk();
});

test('doctor cannot access patient portal', function () {
    $user = User::factory()->create();
    $user->assignRole('doctor');

    $this->actingAs($user)
        ->get('/my-appointments')
        ->assertStatus(403);
});

// ═══ Dashboard accessible by all authenticated ═══

test('all roles can access dashboard', function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        $user = User::factory()->create();
        $user->assignRole($role);

        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk();
    }
});
