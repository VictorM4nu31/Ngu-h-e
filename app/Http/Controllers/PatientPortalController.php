<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use App\Actions\Appointments\CreateAppointmentAction;

class PatientPortalController extends Controller
{
    /**
     * Get the patient record for the authenticated user.
     */
    private function getPatient(): ?Patient
    {
        return Patient::where('user_id', auth()->id())->first();
    }

    /**
     * Display the form to book an appointment.
     */
    public function createAppointment()
    {
        $doctors = User::role('doctor')->get(['id', 'name']);

        return Inertia::render('patient/book-appointment', [
            'doctors' => $doctors,
        ]);
    }

    /**
     * Get availability slots for a doctor and date.
     */
    public function getAvailability(Request $request)
    {
        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date_format:Y-m-d',
        ]);

        $doctor_id = $request->doctor_id;
        $date = $request->date;

        $carbonDate = Carbon::createFromFormat('Y-m-d', $date);
        $dayOfWeek = $carbonDate->dayOfWeek; // 0 (Domingo) - 6 (Sábado)

        // Obtener el horario configurado por el doctor
        $schedule = \App\Models\DoctorSchedule::where('user_id', $doctor_id)
            ->where('day_of_week', $dayOfWeek)
            ->first();

        // Si no trabaja ese día o no tiene horario, retornar lista vacía (sin slots)
        if (!$schedule || !$schedule->is_working) {
            return response()->json(['slots' => []]);
        }

        $interval = 30; // minutos

        $slots = [];
        $current = Carbon::createFromFormat('Y-m-d H:i:s', "$date {$schedule->start_time}");
        $end_time_limit = Carbon::createFromFormat('Y-m-d H:i:s', "$date {$schedule->end_time}");

        // Obtener citas existentes para ese día y doctor
        $existing_appointments = Appointment::where('doctor_id', $doctor_id)
            ->whereDate('start_time', $date)
            ->whereIn('status', ['scheduled', 'confirmed', 'completed'])
            ->get(['start_time', 'end_time']);

        while ($current->lt($end_time_limit)) {
            $slot_start = $current->copy();
            $slot_end = $current->copy()->addMinutes($interval);

            // Verificar si hay una cita que se solape
            $is_occupied = $existing_appointments->contains(function ($app) use ($slot_start, $slot_end) {
                return ($app->start_time < $slot_end && $app->end_time > $slot_start);
            });

            // No permitir citas en el pasado si es hoy
            $is_past = $slot_start->isPast();

            $slots[] = [
                'time' => $slot_start->format('H:i'),
                'available' => !$is_occupied && !$is_past,
            ];

            $current->addMinutes($interval);
        }

        return response()->json(['slots' => $slots]);
    }

    /**
     * Store a new appointment booked by a patient.
     */
    public function storeAppointment(Request $request, CreateAppointmentAction $action)
    {
        $patient = $this->getPatient();
        if (!$patient) {
            return redirect()->back()->with('error', 'No tienes un perfil de paciente creado.');
        }

        $request->validate([
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'reason' => 'nullable|string|max:255',
        ]);

        $start_time = Carbon::createFromFormat('Y-m-d H:i', $request->date . ' ' . $request->time);
        $end_time = $start_time->copy()->addMinutes(30);

        // Doble verificación de disponibilidad
        $conflict = Appointment::where('doctor_id', $request->doctor_id)
            ->where(function($query) use ($start_time, $end_time) {
                $query->where('start_time', '<', $end_time)
                      ->where('end_time', '>', $start_time);
            })
            ->whereIn('status', ['scheduled', 'confirmed', 'completed'])
            ->exists();

        if ($conflict) {
            return redirect()->back()->withErrors(['time' => 'Este horario ya no está disponible.']);
        }

        $action->execute([
            'patient_id' => $patient->id,
            'doctor_id' => $request->doctor_id,
            'start_time' => $start_time,
            'end_time' => $end_time,
            'status' => 'scheduled',
            'reason' => $request->reason,
        ]);

        return redirect()->route('patient.appointments')->with('success', 'Cita agendada correctamente.');
    }

    /**
     * Display the patient's own appointments.
     */
    public function appointments()
    {
        $patient = $this->getPatient();

        if (!$patient) {
            return Inertia::render('patient/my-appointments', [
                'appointments' => [],
            ]);
        }

        $appointments = Appointment::with(['doctor'])
            ->where('patient_id', $patient->id)
            ->latest('start_time')
            ->paginate(10);

        return Inertia::render('patient/my-appointments', [
            'appointments' => $appointments,
        ]);
    }

    /**
     * Display the patient's own prescriptions.
     */
    public function prescriptions()
    {
        $patient = $this->getPatient();

        if (!$patient) {
            return Inertia::render('patient/my-prescriptions', [
                'prescriptions' => [],
            ]);
        }

        $prescriptions = Prescription::with(['consultation.doctor'])
            ->where('patient_id', $patient->id)
            ->latest()
            ->paginate(10);

        return Inertia::render('patient/my-prescriptions', [
            'prescriptions' => $prescriptions,
        ]);
    }
}
