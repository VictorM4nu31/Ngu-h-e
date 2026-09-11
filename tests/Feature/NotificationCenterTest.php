<?php

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Notifications\ProfileCompletionReminder;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

function centerContext(): array
{
    $admin = User::factory()->create();
    $admin->assignRole('admin');
    $doctor = User::factory()->create();
    $doctor->assignRole('doctor');
    $receptionist = User::factory()->create();
    $receptionist->assignRole('receptionist');
    $patientUser = User::factory()->create();
    $patientUser->assignRole('patient');
    $patient = Patient::create([
        'user_id' => $patientUser->id,
        'full_name' => 'Paciente Centro',
        'document_id' => 'CTR-001',
    ]);

    return [$admin, $doctor, $receptionist, $patientUser, $patient];
}

test('consultation with prescription notifies the patient', function () {
    [$admin, $doctor, $receptionist, $patientUser, $patient] = centerContext();

    $this->actingAs($doctor)
        ->post(route('consultations.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'reason_for_visit' => 'Chequeo',
            'diagnosis' => 'Sano',
            'prescription_items' => [
                ['medication' => 'Paracetamol', 'dosage' => '500mg'],
            ],
        ])
        ->assertRedirect();

    $notification = $patientUser->notifications()->latest()->first();
    expect($notification)->not->toBeNull()
        ->and($notification->data['url'])->toBe('/my-prescriptions')
        ->and($notification->data['icon'])->toBe('prescription')
        ->and($doctor->notifications()->count())->toBe(0);
});

test('standalone payment notifies the patient and the other staff', function () {
    [$admin, $doctor, $receptionist, $patientUser, $patient] = centerContext();

    $this->actingAs($receptionist)
        ->post(route('payments.store'), [
            'patient_id' => $patient->id,
            'amount' => 300,
            'payment_method' => 'cash',
            'status' => 'paid',
        ])
        ->assertRedirect();

    expect($patientUser->notifications()->count())->toBe(1)
        ->and($admin->notifications()->count())->toBe(1)
        ->and($receptionist->notifications()->count())->toBe(0);

    $staffNotification = $admin->notifications()->latest()->first();
    expect($staffNotification->data['url'])->toBe('/payments');
});

test('consultation with payment notifies the patient once for the payment', function () {
    [$admin, $doctor, $receptionist, $patientUser, $patient] = centerContext();

    $this->actingAs($doctor)
        ->post(route('consultations.store'), [
            'patient_id' => $patient->id,
            'doctor_id' => $doctor->id,
            'reason_for_visit' => 'Chequeo',
            'diagnosis' => 'Sano',
            'payment_amount' => 250,
        ])
        ->assertRedirect();

    expect($patientUser->notifications()->where('type', App\Notifications\PaymentRegistered::class)->count())->toBe(1);
});

test('reminder command notifies once for tomorrow appointments', function () {
    [$admin, $doctor, $receptionist, $patientUser, $patient] = centerContext();

    $base = Carbon::tomorrow()->setTime(9, 0);
    $appointment = Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => $base,
        'end_time' => $base->copy()->addMinutes(30),
        'status' => 'scheduled',
    ]);

    // Far-future appointment must not trigger.
    Appointment::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'start_time' => Carbon::now()->addDays(5)->setTime(9, 0),
        'end_time' => Carbon::now()->addDays(5)->setTime(9, 30),
        'status' => 'scheduled',
    ]);

    $this->artisan('app:notify-upcoming-appointments')
        ->assertSuccessful();

    expect($patientUser->notifications()->count())->toBe(1)
        ->and($doctor->notifications()->count())->toBe(1)
        ->and($appointment->fresh()->reminder_sent_at)->not->toBeNull();

    // Second run sends nothing (already flagged).
    $this->artisan('app:notify-upcoming-appointments')
        ->assertSuccessful();

    expect($patientUser->notifications()->count())->toBe(1);
});

test('profile command reminds only incomplete profiles once a week', function () {
    [$admin, $doctor, $receptionist, $patientUser, $patient] = centerContext();

    $completeUser = User::factory()->create();
    $completeUser->assignRole('patient');
    Patient::create([
        'user_id' => $completeUser->id,
        'full_name' => 'Completo',
        'document_id' => 'CTR-002',
        'phone' => '5550000000',
        'address' => 'Calle 1',
    ]);

    $this->artisan('app:notify-incomplete-profiles')
        ->assertSuccessful();

    expect($patientUser->notifications()->where('type', ProfileCompletionReminder::class)->count())->toBe(1)
        ->and($completeUser->notifications()->count())->toBe(0);

    // Second run within the week sends nothing new.
    $this->artisan('app:notify-incomplete-profiles')
        ->assertSuccessful();

    expect($patientUser->notifications()->where('type', ProfileCompletionReminder::class)->count())->toBe(1);
});
