<?php

namespace App\Models;

use App\Concerns\SerializesWithTimezone;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SerializesWithTimezone, SoftDeletes;

    protected $fillable = [
        'patient_id',
        'consultation_id',
        'amount',
        'payment_method',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }
}
