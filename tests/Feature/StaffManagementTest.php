<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

function adminUser(): User
{
    $user = User::factory()->create();
    $user->assignRole('admin');

    return $user;
}

test('admin can register a doctor', function () {
    $admin = adminUser();

    $this->actingAs($admin)
        ->post(route('staff.store'), [
            'name' => 'Dr. Nuevo',
            'email' => 'nuevo@ngu.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'doctor',
        ])
        ->assertRedirect(route('staff.index'));

    $this->assertDatabaseHas('users', ['email' => 'nuevo@ngu.com']);
    $this->assertTrue(User::where('email', 'nuevo@ngu.com')->first()->hasRole('doctor'));
});

test('admin cannot register a user with an invalid role', function () {
    $admin = adminUser();

    $this->actingAs($admin)
        ->post(route('staff.store'), [
            'name' => 'Bad Role',
            'email' => 'badrole@ngu.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'superuser',
        ])
        ->assertSessionHasErrors(['role']);
});

test('staff index is paginated', function () {
    $admin = adminUser();

    $response = $this->actingAs($admin)->get(route('staff.index'))->assertOk();

    $response->assertInertia(fn ($page) => $page
        ->component('doctors/index')
        ->has('staff.data'));
});

test('admin can update a doctor role', function () {
    $admin = adminUser();
    $doctor = User::factory()->create(['email' => 'cambio@ngu.com']);
    $doctor->assignRole('doctor');

    $this->actingAs($admin)
        ->put(route('staff.update', $doctor), [
            'name' => 'Dr. Cambio',
            'email' => 'cambio@ngu.com',
            'role' => 'receptionist',
        ])
        ->assertRedirect(route('staff.index'));

    $this->assertTrue($doctor->fresh()->hasRole('receptionist'));
});

test('a doctor can save its weekly schedule', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $schedules = [];
    for ($i = 0; $i < 7; $i++) {
        $schedules[] = [
            'day_of_week' => $i,
            'is_working' => $i >= 1 && $i <= 5,
            'start_time' => $i >= 1 && $i <= 5 ? '09:00' : null,
            'end_time' => $i >= 1 && $i <= 5 ? '18:00' : null,
        ];
    }

    $this->actingAs($doctor)
        ->post(route('doctor.schedule.store'), [
            'schedules' => $schedules,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('doctor_schedules', [
        'user_id' => $doctor->id,
        'day_of_week' => 1,
        'is_working' => true,
    ]);
});

test('a doctor schedule must contain seven days', function () {
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $schedules = [
        ['day_of_week' => 0, 'is_working' => false, 'start_time' => null, 'end_time' => null],
    ];

    $this->actingAs($doctor)
        ->post(route('doctor.schedule.store'), ['schedules' => $schedules])
        ->assertSessionHasErrors(['schedules']);
});
