<?php

namespace App\Actions\Patients;

use App\Models\Patient;

class CreatePatientAction
{
    public function execute(array $data): Patient
    {
        return Patient::create($data);
    }
}
