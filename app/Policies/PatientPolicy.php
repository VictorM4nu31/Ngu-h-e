<?php

namespace App\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    /**
     * Staff (admin, doctor, receptionist) manage patients.
     */
    public function viewAny(User $user): bool
    {
        return $this->isStaff($user);
    }

    public function create(User $user): bool
    {
        return $this->isStaff($user);
    }

    public function view(User $user, Patient $patient): bool
    {
        return $this->isStaff($user);
    }

    public function update(User $user, Patient $patient): bool
    {
        return $this->isStaff($user);
    }

    /**
     * Only the admin can delete a patient.
     */
    public function delete(User $user, Patient $patient): bool
    {
        return $user->hasRole('admin');
    }

    private function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'doctor', 'receptionist']);
    }
}
