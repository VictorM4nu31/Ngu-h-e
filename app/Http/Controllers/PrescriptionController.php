<?php

namespace App\Http\Controllers;

use App\Actions\Prescriptions\GeneratePrescriptionPdfAction;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Validate that the user can access this prescription.
     */
    private function authorizeAccess(Prescription $prescription): void
    {
        $user = request()->user();

        // Admin puede ver todo
        if ($user->hasRole('admin')) {
            return;
        }

        // Doctor: solo sus propias consultas
        if ($user->hasRole('doctor') && $prescription->consultation->doctor_id === $user->id) {
            return;
        }

        // Patient: solo sus propias recetas
        if ($user->hasRole('patient')) {
            $patient = \App\Models\Patient::where('user_id', $user->id)->first();
            if ($patient && $prescription->patient_id === $patient->id) {
                return;
            }
        }

        // Receptionist puede ver recetas (para entregarlas al paciente)
        if ($user->hasRole('receptionist')) {
            return;
        }

        abort(403, 'No tienes acceso a esta receta.');
    }

    /**
     * Download the prescription as PDF.
     */
    public function download(Prescription $prescription, GeneratePrescriptionPdfAction $action)
    {
        $prescription->load('consultation');
        $this->authorizeAccess($prescription);

        $pdf = $action->execute($prescription);
        
        $filename = "receta-{$prescription->patient->full_name}-" . now()->format('Ymd') . ".pdf";
        
        return $pdf->download($filename);
    }

    /**
     * Preview the prescription as PDF in browser.
     */
    public function show(Prescription $prescription, GeneratePrescriptionPdfAction $action)
    {
        $prescription->load('consultation');
        $this->authorizeAccess($prescription);

        $pdf = $action->execute($prescription);
        
        return $pdf->stream();
    }
}
