<?php

namespace App\Concerns;

use DateTimeInterface;

trait SerializesWithTimezone
{
    /**
     * Serialize dates to ISO-8601 including the application timezone offset so
     * the frontend can render them in the clinic's local time regardless of the
     * visitor's browser timezone.
     */
    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format('Y-m-d\TH:i:sP');
    }
}
