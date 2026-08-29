<?php

namespace App\Models;

use App\Concerns\SerializesWithTimezone;
use App\Enums\AppointmentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Appointment extends Model
{
    use HasFactory, SerializesWithTimezone, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'doctor_id',
        'start_time',
        'end_time',
        'status',
        'reason',
        'notes',
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'status' => AppointmentStatus::class,
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }
}
