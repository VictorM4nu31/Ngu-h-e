<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Paid = 'paid';
    case Pending = 'pending';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Paid => 'Pagado',
            self::Pending => 'Pendiente',
            self::Cancelled => 'Cancelado',
        };
    }
}
