<?php

namespace App\Http\Controllers;

use App\Actions\Appointments\CreateAppointmentAction;
use App\Actions\Appointments\EnsureAppointmentAvailability;
use App\Actions\Appointments\UpdateAppointmentAction;
use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Appointment::with(['patient', 'doctor']);

        // Doctor solo ve sus propias citas
        if ($request->user()->hasRole('doctor')) {
            $query->where('doctor_id', $request->user()->id);
        } elseif ($request->has('doctor_id')) {
            $query->where('doctor_id', $request->get('doctor_id'));
        }

        if ($request->has('date')) {
            $query->whereDate('start_time', $request->get('date'));
        }

        $appointments = $query->latest('start_time')->paginate(20)->withQueryString();

        $doctors = User::role('doctor')->get(['id', 'name']);

        return Inertia::render('appointments/index', [
            'appointments' => $appointments,
            'doctors' => $doctors,
            'filters' => $request->only(['doctor_id', 'date']),
        ]);
    }

    public function create(Request $request)
    {
        $patients = Patient::oldest('full_name')->get(['id', 'full_name']);
        $doctors = User::role('doctor')->get(['id', 'name']);

        return Inertia::render('appointments/create', [
            'patients' => $patients,
            'doctors' => $doctors,
            'selected_patient_id' => $request->get('patient_id'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, CreateAppointmentAction $action, EnsureAppointmentAvailability $availability)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'reason' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $availability->noOverlap(
            (int) $validated['doctor_id'],
            Carbon::parse($validated['start_time']),
            Carbon::parse($validated['end_time']),
        );

        $action->execute($validated);

        return redirect()->route('appointments.index')->with('success', 'Cita agendada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment, UpdateAppointmentAction $action, EnsureAppointmentAvailability $availability)
    {
        $validated = $request->validate([
            'status' => ['sometimes', Rule::enum(AppointmentStatus::class)],
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'notes' => 'nullable|string',
        ]);

        $availability->noOverlap(
            (int) $appointment->doctor_id,
            Carbon::parse($validated['start_time'] ?? $appointment->start_time),
            Carbon::parse($validated['end_time'] ?? $appointment->end_time),
            $appointment->id,
        );

        $action->execute($appointment, $validated);

        return redirect()->back()->with('success', 'Cita actualizada.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $appointment->delete();

        return redirect()->back()->with('success', 'Cita eliminada.');
    }
}
