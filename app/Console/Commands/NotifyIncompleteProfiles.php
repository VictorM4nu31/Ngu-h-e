<?php

namespace App\Console\Commands;

use App\Models\Patient;
use App\Notifications\ProfileCompletionReminder;
use Illuminate\Console\Command;

class NotifyIncompleteProfiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:notify-incomplete-profiles';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remind patients with incomplete basic data (at most once a week).';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $patients = Patient::with('user')
            ->whereNotNull('user_id')
            ->where(function ($query) {
                $query->whereNull('phone')->orWhere('phone', '')
                    ->orWhereNull('address')->orWhere('address', '');
            })
            ->get()
            ->filter(fn (Patient $patient) => ! $this->recentlyReminded($patient));

        foreach ($patients as $patient) {
            $patient->user->notify(new ProfileCompletionReminder($patient));
        }

        $this->info("Reminders sent: {$patients->count()}.");

        return self::SUCCESS;
    }

    private function recentlyReminded(Patient $patient): bool
    {
        return $patient->user->notifications()
            ->where('type', ProfileCompletionReminder::class)
            ->whereNull('read_at')
            ->where('created_at', '>=', now()->subWeek())
            ->exists();
    }
}
