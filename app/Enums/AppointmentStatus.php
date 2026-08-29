<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Scheduled = 'scheduled';
    case Confirmed = 'confirmed';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case NoShow = 'no_show';

    public function label(): string
    {
        return match ($this) {
            self::Scheduled => 'Programada',
            self::Confirmed => 'Confirmada',
            self::Completed => 'Completada',
            self::Cancelled => 'Cancelada',
            self::NoShow => 'No asistió',
        };
    }
}
