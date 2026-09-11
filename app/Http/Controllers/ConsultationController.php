<?php

namespace App\Http\Controllers;

use App\Actions\Consultations\CreateConsultationAction;
use App\Http\Requests\Consultations\StoreConsultationRequest;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\User;
use App\Notifications\PaymentRegistered;
use App\Notifications\PrescriptionIssued;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ConsultationController extends Controller
{
    /**
     * Display consultations visible to the authenticated user.
     */
    public function index(Request $request)
    {
        $query = Consultation::with(['patient', 'doctor'])->latest();

        if ($request->user()->hasRole('doctor')) {
            $query->where('doctor_id', $request->user()->id);
        }

        return Inertia::render('consultations/index', [
            'consultations' => $query->paginate(20)->withQueryString(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $patient = null;
        $appointment = null;

        if ($request->has('patient_id')) {
            $patient = Patient::findOrFail($request->get('patient_id'));
        }

        if ($request->has('appointment_id')) {
            $appointment = Appointment::with('patient')->findOrFail($request->get('appointment_id'));
            $patient = $appointment->patient;
        }

        if (! $patient) {
            return redirect()->route('patients.index')
                ->with('error', 'Por favor seleccione un paciente para iniciar la consulta.');
        }

        // Admins must pick the attending doctor; doctors always record under
        // their own id (selected client-side, enforced again on store).
        $doctors = $request->user()->hasRole('admin')
            ? User::role('doctor')->oldest('name')->get(['id', 'name'])
            : null;

        return Inertia::render('consultations/create', [
            'patient' => $patient,
            'appointment' => $appointment,
            'doctors' => $doctors,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreConsultationRequest $request, CreateConsultationAction $action)
    {
        $validated = $request->validated();

        if ($request->user()->hasRole('admin')) {
            // Admins record consultations on behalf of a doctor: the id must
            // belong to a user with the doctor role (prevents attributing
            // clinical records to non-doctors).
            $doctor = User::role('doctor')->find($validated['doctor_id'] ?? null);

            if (! $doctor) {
                throw ValidationException::withMessages([
                    'doctor_id' => 'Seleccione un médico válido.',
                ]);
            }

            $validated['doctor_id'] = $doctor->id;
        } else {
            // Doctors always record under their own id (prevenir suplantación)
            $validated['doctor_id'] = $request->user()->id;
        }

        $consultation = $action->execute($validated);
        $consultation->loadMissing(['prescription', 'payment']);

        if ($consultation->prescription !== null) {
            PrescriptionIssued::dispatchFor($consultation->prescription, $request->user());
        }

        if ($consultation->payment !== null) {
            PaymentRegistered::dispatchFor($consultation->payment, $request->user());
        }

        return redirect()->route('patients.show', $validated['patient_id'])
            ->with('success', 'Consulta registrada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Consultation $consultation)
    {
        $this->authorize('view', $consultation);

        return Inertia::render('consultations/show', [
            'consultation' => $consultation->load(['patient', 'doctor', 'prescription']),
        ]);
    }
}
