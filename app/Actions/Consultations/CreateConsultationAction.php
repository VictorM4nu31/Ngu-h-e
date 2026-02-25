<?php

namespace App\Actions\Consultations;

use App\Models\Consultation;
use App\Models\Appointment;
use Illuminate\Support\Facades\DB;

class CreateConsultationAction
{
    public function execute(array $data): Consultation
    {
        return DB::transaction(function () use ($data) {
            $consultation = Consultation::create($data);

            if (!empty($data['appointment_id'])) {
                $appointment = Appointment::find($data['appointment_id']);
                if ($appointment) {
                    $appointment->update(['status' => 'completed']);
                }
            }

            return $consultation;
        });
    }
}
