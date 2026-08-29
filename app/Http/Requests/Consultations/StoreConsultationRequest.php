<?php

namespace App\Http\Requests\Consultations;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreConsultationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'exists:patients,id'],
            'doctor_id' => ['required', 'exists:users,id'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'weight' => ['nullable', 'numeric', 'between:0,500'],
            'height' => ['nullable', 'numeric', 'between:0,300'],
            'temperature' => ['nullable', 'numeric', 'between:30,45'],
            'bp_systolic' => ['nullable', 'integer', 'between:40,250'],
            'bp_diastolic' => ['nullable', 'integer', 'between:30,150'],
            'heart_rate' => ['nullable', 'integer', 'between:30,220'],
            'respiratory_rate' => ['nullable', 'integer', 'between:8,60'],
            'oxygen_saturation' => ['nullable', 'integer', 'between:50,100'],
            'reason_for_visit' => ['required', 'string'],
            'clinical_findings' => ['nullable', 'string'],
            'diagnosis' => ['required', 'string'],
            'treatment_plan' => ['nullable', 'string'],
            'prescription_items' => ['nullable', 'array'],
            'prescription_items.*.medication' => ['required_with:prescription_items', 'string'],
            'prescription_items.*.dosage' => ['required_with:prescription_items', 'string'],
            'prescription_items.*.frequency' => ['nullable', 'string'],
            'prescription_items.*.duration' => ['nullable', 'string'],
            'prescription_instructions' => ['nullable', 'string'],
            'payment_amount' => ['nullable', 'numeric', 'min:0'],
            'payment_method' => ['nullable', Rule::enum(PaymentMethod::class)],
        ];
    }
}
