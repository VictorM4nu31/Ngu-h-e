<?php

namespace App\Actions\Prescriptions;

use App\Models\Prescription;
use Illuminate\Support\Facades\DB;

class CreatePrescriptionAction
{
    /**
     * Create a new prescription.
     *
     * @param array $data
     * @return Prescription
     */
    public function execute(array $data): Prescription
    {
        return DB::transaction(function () use ($data) {
            return Prescription::create($data);
        });
    }
}
