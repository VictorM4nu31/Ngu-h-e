<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    public function view(User $user, Prescription $prescription): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('receptionist')) {
            return true;
        }

        if ($user->hasRole('doctor')) {
            return $prescription->consultation->doctor_id === $user->id;
        }

        if ($user->hasRole('patient')) {
            $patient = Patient::where('user_id', $user->id)->first();

            return $patient !== null && $prescription->patient_id === $patient->id;
        }

        return false;
    }
}
