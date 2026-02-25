<?php

namespace App\Actions\Payments;

use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class CreatePaymentAction
{
    /**
     * Create a new payment record.
     */
    public function execute(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            return Payment::create([
                'patient_id' => $data['patient_id'],
                'consultation_id' => $data['consultation_id'] ?? null,
                'amount' => $data['amount'],
                'payment_method' => $data['payment_method'],
                'status' => $data['status'] ?? 'paid',
                'notes' => $data['notes'] ?? null,
            ]);
        });
    }
}
