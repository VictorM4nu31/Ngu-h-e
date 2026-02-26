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
    public function index(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();

        if ($user->hasRole('patient')) {
            return $this->patientDashboard($user, $today);
        }

        if ($user->hasRole('doctor')) {
            return $this->doctorDashboard($user, $today);
        }

        // Admin / Receptionist: vista global
        return $this->globalDashboard($today);
    }

    private function globalDashboard(Carbon $today)
    {
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

    private function doctorDashboard($user, Carbon $today)
    {
        $stats = [
            'total_patients' => Patient::whereHas('consultations', fn ($q) => $q->where('doctor_id', $user->id))->count(),
            'appointments_today' => Appointment::where('doctor_id', $user->id)->whereDate('start_time', $today)->count(),
            'pending_appointments' => Appointment::where('doctor_id', $user->id)
                ->whereDate('start_time', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->count(),
            'consultations_today' => Consultation::where('doctor_id', $user->id)->whereDate('created_at', $today)->count(),
        ];

        $recent_consultations = Consultation::with(['patient', 'doctor'])
            ->where('doctor_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        $upcoming_appointments = Appointment::with(['patient', 'doctor'])
            ->where('doctor_id', $user->id)
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

    private function patientDashboard($user, Carbon $today)
    {
        $patient = \App\Models\Patient::where('user_id', $user->id)->first();

        $stats = [
            'total_patients' => 0,
            'appointments_today' => $patient ? Appointment::where('patient_id', $patient->id)->whereDate('start_time', $today)->count() : 0,
            'pending_appointments' => $patient ? Appointment::where('patient_id', $patient->id)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->count() : 0,
            'consultations_today' => 0,
        ];

        $upcoming_appointments = $patient
            ? Appointment::with(['patient', 'doctor'])
                ->where('patient_id', $patient->id)
                ->whereDate('start_time', '>=', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->orderBy('start_time')
                ->get()
            : collect();

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentConsultations' => [],
            'upcomingAppointments' => $upcoming_appointments,
        ]);
    }
}
