<?php

namespace App\Http\Controllers;

use App\Actions\Prescriptions\GeneratePrescriptionPdfAction;
use App\Models\Prescription;

class PrescriptionController extends Controller
{
    /**
     * Validate that the user can access this prescription.
     */
    private function authorizeAccess(Prescription $prescription): void
    {
        $this->authorize('view', $prescription);
    }

    /**
     * Download the prescription as PDF.
     */
    public function download(Prescription $prescription, GeneratePrescriptionPdfAction $action)
    {
        $prescription->load('consultation');
        $this->authorizeAccess($prescription);

        $pdf = $action->execute($prescription);

        $filename = "receta-{$prescription->patient->full_name}-".now()->format('Ymd').'.pdf';

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
