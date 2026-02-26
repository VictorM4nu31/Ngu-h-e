<?php

namespace App\Http\Controllers;

use App\Actions\Consultations\CreateConsultationAction;
use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConsultationController extends Controller
{
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
    public function store(Request $request, CreateConsultationAction $action)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'appointment_id' => 'nullable|exists:appointments,id',
            'weight' => 'nullable|numeric|between:0,500',
            'height' => 'nullable|numeric|between:0,300',
            'temperature' => 'nullable|numeric|between:30,45',
            'bp_systolic' => 'nullable|integer|between:40,250',
            'bp_diastolic' => 'nullable|integer|between:30,150',
            'heart_rate' => 'nullable|integer|between:30,220',
            'respiratory_rate' => 'nullable|integer|between:8,60',
            'oxygen_saturation' => 'nullable|integer|between:50,100',
            'reason_for_visit' => 'required|string',
            'clinical_findings' => 'nullable|string',
            'diagnosis' => 'required|string',
            'treatment_plan' => 'nullable|string',
            // Prescription Data
            'prescription_items' => 'nullable|array',
            'prescription_items.*.medication' => 'required_with:prescription_items|string',
            'prescription_items.*.dosage' => 'required_with:prescription_items|string',
            'prescription_items.*.frequency' => 'nullable|string',
            'prescription_items.*.duration' => 'nullable|string',
            'prescription_instructions' => 'nullable|string',
            // Payment Data
            'payment_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string|in:cash,card,transfer',
        ]);

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
        $user = request()->user();

        // Solo el doctor asignado o un admin puede ver la consulta
        if ($user->hasRole('doctor') && $consultation->doctor_id !== $user->id) {
            abort(403, 'No tienes acceso a esta consulta.');
        }

        return Inertia::render('consultations/show', [
            'consultation' => $consultation->load(['patient', 'doctor', 'prescription']),
        ]);
    }
}
