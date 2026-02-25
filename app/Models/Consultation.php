<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Consultation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'weight',
        'height',
        'temperature',
        'bp_systolic',
        'bp_diastolic',
        'heart_rate',
        'respiratory_rate',
        'oxygen_saturation',
        'reason_for_visit',
        'clinical_findings',
        'diagnosis',
        'treatment_plan',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function prescription(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Prescription::class);
    }
}
