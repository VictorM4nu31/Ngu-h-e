<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\DashboardController;

use App\Http\Controllers\PatientController;
use App\Http\Controllers\PrescriptionController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard — todos los roles autenticados
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Prescriptions — todos los autenticados (controller valida ownership)
    Route::get('prescriptions/{prescription}/download', [PrescriptionController::class, 'download'])->name('prescriptions.download');
    Route::get('prescriptions/{prescription}/preview', [PrescriptionController::class, 'show'])->name('prescriptions.preview');

    // ═══ Admin + Doctor + Receptionist ═══
    Route::middleware(['role:admin|doctor|receptionist'])->group(function () {
        Route::resource('patients', PatientController::class);
        Route::resource('appointments', \App\Http\Controllers\AppointmentController::class);

        // Attachments
        Route::post('patients/{patient}/attachments', [App\Http\Controllers\AttachmentController::class, 'storePatient'])->name('patients.attachments.store');
        Route::delete('attachments/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])->name('attachments.destroy');
    });

    // ═══ Solo Doctor ═══
    Route::middleware(['role:doctor'])->group(function () {
        Route::get('my-schedule', [\App\Http\Controllers\DoctorScheduleController::class, 'index'])->name('doctor.schedule');
        Route::post('my-schedule', [\App\Http\Controllers\DoctorScheduleController::class, 'store'])->name('doctor.schedule.store');
    });

    // ═══ Admin + Doctor (consultas) ═══
    Route::middleware(['role:admin|doctor'])->group(function () {
        Route::resource('consultations', \App\Http\Controllers\ConsultationController::class);
    });

    // ═══ Admin + Receptionist (pagos) ═══
    Route::middleware(['role:admin|receptionist'])->group(function () {
        Route::get('payments', [App\Http\Controllers\PaymentController::class, 'index'])->name('payments.index');
        Route::post('payments', [App\Http\Controllers\PaymentController::class, 'store'])->name('payments.store');
    });

    // ═══ Solo Admin (reportes + staff) ═══
    Route::middleware(['role:admin'])->group(function () {
        Route::get('reports', [App\Http\Controllers\ReportsController::class, 'index'])->name('reports.index');
        Route::get('staff', [App\Http\Controllers\DoctorController::class, 'index'])->name('staff.index');
        Route::get('staff/create', [App\Http\Controllers\DoctorController::class, 'create'])->name('staff.create');
        Route::post('staff', [App\Http\Controllers\DoctorController::class, 'store'])->name('staff.store');
        Route::get('staff/{user}/edit', [App\Http\Controllers\DoctorController::class, 'edit'])->name('staff.edit');
        Route::put('staff/{user}', [App\Http\Controllers\DoctorController::class, 'update'])->name('staff.update');
        Route::delete('staff/{user}', [App\Http\Controllers\DoctorController::class, 'destroy'])->name('staff.destroy');
    });

    // ═══ Patient: portal propio ═══
    Route::middleware(['role:patient'])->group(function () {
        Route::get('my-appointments', [App\Http\Controllers\PatientPortalController::class, 'appointments'])->name('patient.appointments');
        Route::get('my-prescriptions', [App\Http\Controllers\PatientPortalController::class, 'prescriptions'])->name('patient.prescriptions');
        
        // Agendamiento de citas
        Route::get('book-appointment', [App\Http\Controllers\PatientPortalController::class, 'createAppointment'])->name('patient.appointments.create');
        Route::post('book-appointment', [App\Http\Controllers\PatientPortalController::class, 'storeAppointment'])->name('patient.appointments.store');
        Route::get('api/availability', [App\Http\Controllers\PatientPortalController::class, 'getAvailability'])->name('api.availability');
    });
});

require __DIR__.'/settings.php';
