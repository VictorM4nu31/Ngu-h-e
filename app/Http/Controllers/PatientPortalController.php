<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientPortalController extends Controller
{
    /**
     * Get the patient record for the authenticated user.
     */
    private function getPatient(): ?Patient
    {
        return Patient::where('user_id', auth()->id())->first();
    }

    /**
     * Display the patient's own appointments.
     */
    public function appointments()
    {
        $patient = $this->getPatient();

        if (!$patient) {
            return Inertia::render('patient/my-appointments', [
                'appointments' => [],
            ]);
        }

        $appointments = Appointment::with(['doctor'])
            ->where('patient_id', $patient->id)
            ->latest('start_time')
            ->paginate(10);

        return Inertia::render('patient/my-appointments', [
            'appointments' => $appointments,
        ]);
    }

    /**
     * Display the patient's own prescriptions.
     */
    public function prescriptions()
    {
        $patient = $this->getPatient();

        if (!$patient) {
            return Inertia::render('patient/my-prescriptions', [
                'prescriptions' => [],
            ]);
        }

        $prescriptions = Prescription::with(['consultation.doctor'])
            ->where('patient_id', $patient->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('patient/my-prescriptions', [
            'prescriptions' => $prescriptions,
        ]);
    }
}
