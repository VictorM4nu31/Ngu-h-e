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
            'professional_license' => '41872635',
        ])
        ->assertRedirect(route('staff.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'nuevo@ngu.com',
        'professional_license' => '41872635',
    ]);
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

// ═══ Cédula profesional ═══

test('registering a doctor requires a professional license', function () {
    $this->actingAs(adminUser())
        ->post(route('staff.store'), [
            'name' => 'Dr. Sin Cédula',
            'email' => 'sin-cedula@ngu.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'doctor',
        ])
        ->assertSessionHasErrors('professional_license');

    $this->assertDatabaseMissing('users', ['email' => 'sin-cedula@ngu.com']);
});

test('registering a receptionist does not require a professional license', function () {
    $this->actingAs(adminUser())
        ->post(route('staff.store'), [
            'name' => 'Recep Sin Cédula',
            'email' => 'recep-sin-cedula@ngu.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'receptionist',
        ])
        ->assertRedirect(route('staff.index'));

    $this->assertDatabaseHas('users', [
        'email' => 'recep-sin-cedula@ngu.com',
        'professional_license' => null,
    ]);
});

test('professional license must be numeric', function () {
    $this->actingAs(adminUser())
        ->post(route('staff.store'), [
            'name' => 'Dr. Cédula Inválida',
            'email' => 'cedula-invalida@ngu.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'role' => 'doctor',
            'professional_license' => 'ABC-123',
        ])
        ->assertSessionHasErrors('professional_license');
});

test('updating a doctor persists the professional license', function () {
    $admin = adminUser();
    $doctor = User::factory()->doctor()->create(['email' => 'licencia@ngu.com']);
    $doctor->assignRole('doctor');

    $this->actingAs($admin)
        ->put(route('staff.update', $doctor), [
            'name' => 'Dr. García',
            'email' => 'licencia@ngu.com',
            'role' => 'doctor',
            'professional_license' => '90247716',
        ])
        ->assertRedirect(route('staff.index'));

    expect($doctor->fresh()->professional_license)->toBe('90247716');
});

test('demoting a doctor to receptionist clears the professional license', function () {
    $admin = adminUser();
    $doctor = User::factory()->doctor()->create(['email' => 'degradado@ngu.com']);
    $doctor->assignRole('doctor');

    $this->actingAs($admin)
        ->put(route('staff.update', $doctor), [
            'name' => 'Recep Degradado',
            'email' => 'degradado@ngu.com',
            'role' => 'receptionist',
        ])
        ->assertRedirect(route('staff.index'));

    expect($doctor->fresh()->professional_license)->toBeNull();
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

test('admin cannot delete a doctor with active consultations', function () {
    $admin = adminUser();
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $patient = \App\Models\Patient::create([
        'full_name' => 'Paciente de prueba',
        'document_id' => 'STAFF-CONS',
    ]);

    \App\Models\Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'reason_for_visit' => 'Consulta de prueba',
        'diagnosis' => 'Diagnóstico de prueba',
    ]);

    $this->actingAs($admin)
        ->delete(route('staff.destroy', $doctor))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('users', ['id' => $doctor->id, 'deleted_at' => null]);
});

test('admin can delete a doctor without active consultations', function () {
    $admin = adminUser();
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $this->actingAs($admin)
        ->delete(route('staff.destroy', $doctor))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('users', ['id' => $doctor->id]);
});

test('admin cannot delete a doctor with active appointments', function () {
    $admin = adminUser();
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient = \App\Models\Patient::create([
        'full_name' => 'Paciente Cita Activa',
        'document_id' => 'STAFF-APPT',
    ]);

    \App\Models\Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => now()->addDay(),
        'end_time' => now()->addDay()->addMinutes(30),
        'status' => 'scheduled',
    ]);

    $this->actingAs($admin)
        ->delete(route('staff.destroy', $doctor))
        ->assertRedirect()
        ->assertSessionHas('error');

    $this->assertDatabaseHas('users', ['id' => $doctor->id, 'deleted_at' => null]);
});

test('admin can delete a doctor with only cancelled appointments', function () {
    $admin = adminUser();
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');

    $patient = \App\Models\Patient::create([
        'full_name' => 'Paciente Cita Cancelada',
        'document_id' => 'STAFF-APPT-CANC',
    ]);

    \App\Models\Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => now()->addDay(),
        'end_time' => now()->addDay()->addMinutes(30),
        'status' => 'cancelled',
    ]);

    $this->actingAs($admin)
        ->delete(route('staff.destroy', $doctor))
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertSoftDeleted('users', ['id' => $doctor->id]);
});
