<?php

namespace App\Http\Controllers;

use App\Actions\Appointments\CreateAppointmentAction;
use App\Actions\Appointments\UpdateAppointmentAction;
use App\Http\Requests\Appointments\StoreAppointmentRequest;
use App\Http\Requests\Appointments\UpdateAppointmentRequest;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\User;
use App\Notifications\AppointmentStatusChanged;
use Illuminate\Http\Request;
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
            // Only clinical staff may start a consultation from an appointment.
            'canAttend' => $request->user()->hasAnyRole(['admin', 'doctor']),
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

    public function edit(Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        return Inertia::render('appointments/edit', [
            'appointment' => $appointment->load(['patient', 'doctor']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreAppointmentRequest $request, CreateAppointmentAction $action)
    {
        $this->authorize('create', Appointment::class);

        $validated = $request->validated();

        $appointment = $action->execute($validated);

        AppointmentStatusChanged::dispatchFor($appointment, null, $request->user());

        return redirect()->route('appointments.index')->with('success', 'Cita agendada correctamente.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateAppointmentRequest $request, Appointment $appointment, UpdateAppointmentAction $action)
    {
        $this->authorize('update', $appointment);

        $validated = $request->validated();
        $oldStatus = $appointment->status instanceof \BackedEnum
            ? $appointment->status->value
            : (string) $appointment->status;

        $action->execute($appointment, $validated);
        $appointment->refresh();

        $newStatus = $appointment->status instanceof \BackedEnum
            ? $appointment->status->value
            : (string) $appointment->status;

        if ($newStatus !== $oldStatus) {
            AppointmentStatusChanged::dispatchFor($appointment, $oldStatus, $request->user());
        }

        return redirect()->back()->with('success', 'Cita actualizada.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return redirect()->back()->with('success', 'Cita eliminada.');
    }
}
