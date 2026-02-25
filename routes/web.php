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
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('patients', PatientController::class);
    Route::resource('appointments', \App\Http\Controllers\AppointmentController::class);
    Route::resource('consultations', \App\Http\Controllers\ConsultationController::class);
    
    // Attachments
    Route::post('patients/{patient}/attachments', [App\Http\Controllers\AttachmentController::class, 'storePatient'])->name('patients.attachments.store');
    Route::delete('attachments/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])->name('attachments.destroy');

    // Prescriptions
    Route::get('prescriptions/{prescription}/download', [PrescriptionController::class, 'download'])->name('prescriptions.download');
    Route::get('prescriptions/{prescription}/preview', [PrescriptionController::class, 'show'])->name('prescriptions.preview');

    // Payments & Reports
    Route::get('payments', [App\Http\Controllers\PaymentController::class, 'index'])->name('payments.index');
    Route::post('payments', [App\Http\Controllers\PaymentController::class, 'store'])->name('payments.store');
    Route::get('reports', [App\Http\Controllers\ReportsController::class, 'index'])->name('reports.index');
});

require __DIR__.'/settings.php';
