<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

use App\Http\Controllers\PatientController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('patients', PatientController::class);
    Route::resource('appointments', \App\Http\Controllers\AppointmentController::class);
    
    // Attachments
    Route::post('patients/{patient}/attachments', [App\Http\Controllers\AttachmentController::class, 'storePatient'])->name('patients.attachments.store');
    Route::delete('attachments/{attachment}', [App\Http\Controllers\AttachmentController::class, 'destroy'])->name('attachments.destroy');
});

require __DIR__.'/settings.php';
