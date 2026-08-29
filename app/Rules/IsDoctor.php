<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class IsDoctor implements ValidationRule
{
    /**
     * Validate that the given value is the ID of a user with the "doctor" role.
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! User::role('doctor')->whereKey($value)->exists()) {
            $fail('El médico seleccionado no es válido.');
        }
    }
}
