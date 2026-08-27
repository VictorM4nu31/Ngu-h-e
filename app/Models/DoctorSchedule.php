<?php

namespace App\Models;

use App\Concerns\SerializesWithTimezone;
use Illuminate\Database\Eloquent\Model;

class DoctorSchedule extends Model
{
    use SerializesWithTimezone;

    protected $fillable = [
        'user_id',
        'day_of_week',
        'start_time',
        'end_time',
        'is_working',
    ];

    protected $casts = [
        'is_working' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
