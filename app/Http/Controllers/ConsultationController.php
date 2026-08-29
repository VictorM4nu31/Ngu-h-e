<?php

namespace App\Http\Controllers;

use App\Actions\Consultations\CreateConsultationAction;
use App\Http\Requests\Consultations\StoreConsultationRequest;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\Patient;
use Illuminate\Http\Request;
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

        return Inertia::render('consultations/create', [
            'patient' => $patient,
            'appointment' => $appointment,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreConsultationRequest $request, CreateConsultationAction $action)
    {
        $validated = $request->validated();

        // Forzar doctor_id al usuario autenticado (prevenir suplantación)
        $validated['doctor_id'] = $request->user()->id;

        $action->execute($validated);

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
