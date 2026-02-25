<?php

namespace App\Http\Requests\Patients;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
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
            'full_name' => ['sometimes', 'required', 'string', 'max:255'],
            'document_id' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:patients,document_id,' . $this->route('patient')],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'gender' => ['sometimes', 'nullable', 'in:male,female,other'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string'],
            'medical_antecedents' => ['sometimes', 'nullable', 'string'],
            'allergies' => ['sometimes', 'nullable', 'string'],
            'chronic_diseases' => ['sometimes', 'nullable', 'string'],
            'current_medication' => ['sometimes', 'nullable', 'string'],
            'notes' => ['sometimes', 'nullable', 'string'],
        ];
    }
}
