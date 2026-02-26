<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'full_name',
        'document_id',
        'birth_date',
        'gender',
        'phone',
        'email',
        'address',
        'medical_antecedents',
        'allergies',
        'chronic_diseases',
        'current_medication',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    /**
     * Get all of the patient's attachments.
     */
    public function attachments(): \Illuminate\Database\Eloquent\Relations\MorphMany
    {
        return $this->morphMany(Attachment::class, 'attachable');
    }

    /**
     * Get all of the patient's consultations.
     */
    public function consultations(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Consultation::class);
    }

    public function prescriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Prescription::class);
    }

    public function payments(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
