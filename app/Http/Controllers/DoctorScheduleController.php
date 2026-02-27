<?php

namespace App\Http\Controllers;

use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoctorScheduleController extends Controller
{
    /**
     * Display the doctor's schedule form.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Fetch existing schedules or create a default 7-day structure
        $dbSchedules = DoctorSchedule::where('user_id', $user->id)
            ->orderBy('day_of_week')
            ->get()
            ->keyBy('day_of_week');

        $schedules = [];
        for ($i = 0; $i < 7; $i++) {
            if ($dbSchedules->has($i)) {
                $schedules[] = $dbSchedules[$i];
            } else {
                // Default: Monday(1) to Friday(5) working 09:00 - 18:00
                $schedules[] = [
                    'day_of_week' => $i,
                    'is_working' => ($i >= 1 && $i <= 5),
                    'start_time' => '09:00',
                    'end_time' => '18:00',
                ];
            }
        }

        return Inertia::render('doctor/schedule', [
            'schedules' => $schedules,
        ]);
    }

    /**
     * Update the doctor's schedule.
     */
    public function store(Request $request)
    {
        $request->validate([
            'schedules' => 'required|array|size:7',
            'schedules.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedules.*.is_working' => 'required|boolean',
            'schedules.*.start_time' => 'nullable|date_format:H:i',
            'schedules.*.end_time' => 'nullable|date_format:H:i|after:schedules.*.start_time',
        ]);

        $user = $request->user();

        foreach ($request->schedules as $scheduleData) {
            DoctorSchedule::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'day_of_week' => $scheduleData['day_of_week'],
                ],
                [
                    'is_working' => $scheduleData['is_working'],
                    'start_time' => $scheduleData['is_working'] ? $scheduleData['start_time'] : null,
                    'end_time' => $scheduleData['is_working'] ? $scheduleData['end_time'] : null,
                ]
            );
        }

        return redirect()->back()->with('success', 'Horario de atención actualizado correctamente.');
    }
}
