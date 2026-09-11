<?php

namespace App\Http\Requests\PatientPortal;

use App\Models\Patient;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientProfileRequest extends FormRequest
{
    /**
     * Only patients with their own linked record may update it.
     * Identity (full_name, document_id) and clinical data stay staff-only.
     */
    public function authorize(): bool
    {
        $user = $this->user();

        return $user !== null
            && Patient::where('user_id', $user->id)->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'gender' => ['nullable', 'in:male,female,other'],
            'address' => ['nullable', 'string', 'max:500'],
        ];
    }
}
