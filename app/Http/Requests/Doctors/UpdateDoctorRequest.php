<?php

namespace App\Http\Requests\Doctors;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;

class UpdateDoctorRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,'.$this->route('user')->id],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'string', Rule::in(['doctor', 'receptionist'])],
            'professional_license' => [
                Rule::requiredIf($this->input('role') === 'doctor'),
                'nullable',
                'string',
                'max:32',
                'regex:/^[0-9]{6,10}$/',
            ],
        ];
    }

    /**
     * Validation messages for the professional license field.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'professional_license.required' => 'La cédula profesional es obligatoria para los médicos.',
            'professional_license.regex' => 'La cédula profesional debe contener entre 6 y 10 dígitos.',
        ];
    }
}
