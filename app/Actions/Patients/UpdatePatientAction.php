<?php

namespace App\Actions\Patients;

use App\Models\Patient;

class UpdatePatientAction
{
    public function execute(Patient $patient, array $data): Patient
    {
        $patient->update($data);
        return $patient;
    }
}
