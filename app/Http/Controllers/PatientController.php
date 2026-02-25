<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Patient::query();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('document_id', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $patients = $query->latest()->paginate(10)->withQueryString();

        return \Inertia\Inertia::render('patients/index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return \Inertia\Inertia::render('patients/create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(\App\Http\Requests\Patients\StorePatientRequest $request, \App\Actions\Patients\CreatePatientAction $action)
    {
        $action->execute($request->validated());

        return redirect()->route('patients.index')->with('success', 'Paciente registrado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        return \Inertia\Inertia::render('patients/show', [
            'patient' => $patient->load('attachments'),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient)
    {
        return \Inertia\Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\App\Http\Requests\Patients\UpdatePatientRequest $request, Patient $patient, \App\Actions\Patients\UpdatePatientAction $action)
    {
        $action->execute($patient, $request->validated());

        return redirect()->route('patients.index')->with('success', 'Datos del paciente actualizados.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        $patient->delete();

        return redirect()->back()->with('success', 'Paciente eliminado.');
    }
}
