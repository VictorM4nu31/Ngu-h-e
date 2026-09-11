<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Notification reminders (require `php artisan schedule:run` every minute,
// e.g. via cron, plus a running queue worker for realtime delivery).
Schedule::command('app:notify-upcoming-appointments')->dailyAt('18:00');
Schedule::command('app:notify-incomplete-profiles')->weeklyOn(1, '09:00');
