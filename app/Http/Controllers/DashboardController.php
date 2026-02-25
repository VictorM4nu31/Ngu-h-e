<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $today = Carbon::today();
        
        $stats = [
            'total_patients' => Patient::count(),
            'appointments_today' => Appointment::whereDate('start_time', $today)->count(),
            'pending_appointments' => Appointment::whereDate('start_time', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->count(),
            'consultations_today' => Consultation::whereDate('created_at', $today)->count(),
        ];

        $recent_consultations = Consultation::with(['patient', 'doctor'])
            ->latest()
            ->take(5)
            ->get();

        $upcoming_appointments = Appointment::with(['patient', 'doctor'])
            ->whereDate('start_time', $today)
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('start_time')
            ->get();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentConsultations' => $recent_consultations,
            'upcomingAppointments' => $upcoming_appointments,
        ]);
    }
}
