<?php

namespace App\Http\Requests\Patients;

use Illuminate\Foundation\Http\FormRequest;

class StorePatientRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Simplified for now, or check $this->user()->can('patients.create')
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'document_id' => ['nullable', 'string', 'max:50', 'unique:patients,document_id'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string'],
            'medical_antecedents' => ['nullable', 'string'],
            'allergies' => ['nullable', 'string'],
            'chronic_diseases' => ['nullable', 'string'],
            'current_medication' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
