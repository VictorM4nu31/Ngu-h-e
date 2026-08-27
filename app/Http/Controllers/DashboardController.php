<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        if (! $user->hasRole('admin') && ! $user->hasRole('receptionist')) {
            abort(403, 'No tienes acceso al panel.');
        }

        // Admin / Receptionist: vista global
        return $this->globalDashboard($today);
    }

    private function globalDashboard(Carbon $today)
    {
        return $this->buildDashboard(null, $today);
    }

    private function doctorDashboard($user, Carbon $today)
    {
        return $this->buildDashboard($user, $today);
    }

    private function buildDashboard(?User $user, Carbon $today)
    {
        $doctorId = $user?->id;

        $stats = [
            'total_patients' => $doctorId
                ? Patient::whereHas('consultations', fn ($q) => $q->where('doctor_id', $doctorId))->count()
                : Patient::count(),
            'appointments_today' => Appointment::when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
                ->whereDate('start_time', $today)
                ->count(),
            'pending_appointments' => Appointment::when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
                ->whereDate('start_time', $today)
                ->whereIn('status', ['scheduled', 'confirmed'])
                ->count(),
            'consultations_today' => Consultation::when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
                ->whereDate('created_at', $today)
                ->count(),
        ];

        $recent_consultations = Consultation::with(['patient', 'doctor'])
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
            ->latest()
            ->take(5)
            ->get();

        $upcoming_appointments = Appointment::with(['patient', 'doctor'])
            ->when($doctorId, fn ($q) => $q->where('doctor_id', $doctorId))
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
