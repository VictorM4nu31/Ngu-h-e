<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'doctor']);
    Role::firstOrCreate(['name' => 'receptionist']);
    Role::firstOrCreate(['name' => 'patient']);
});

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('users without a role are denied access', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('admins can access the global dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('admin');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('receptionists can access the global dashboard', function () {
    $user = User::factory()->create();
    $user->assignRole('receptionist');

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});
