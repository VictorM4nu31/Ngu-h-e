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

            // Create prescription if items are provided
            if (!empty($data['prescription_items'])) {
                $consultation->prescription()->create([
                    'patient_id' => $data['patient_id'],
                    'doctor_id' => $data['doctor_id'],
                    'items' => $data['prescription_items'],
                    'general_instructions' => $data['prescription_instructions'] ?? null,
                ]);
            }

            // Create payment if amount is provided
            if (!empty($data['payment_amount'])) {
                $consultation->payment()->create([
                    'patient_id' => $data['patient_id'],
                    'amount' => $data['payment_amount'],
                    'payment_method' => $data['payment_method'] ?? 'cash',
                    'status' => 'paid',
                    'notes' => 'Cobro automático de consulta',
                ]);
            }

            return $consultation;
        });
    }
}
