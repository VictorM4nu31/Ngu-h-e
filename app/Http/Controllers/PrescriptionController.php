<?php

namespace App\Http\Controllers;

use App\Actions\Prescriptions\GeneratePrescriptionPdfAction;
use App\Models\Prescription;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Download the prescription as PDF.
     */
    public function download(Prescription $prescription, GeneratePrescriptionPdfAction $action)
    {
        $pdf = $action->execute($prescription);
        
        $filename = "receta-{$prescription->patient->full_name}-" . now()->format('Ymd') . ".pdf";
        
        return $pdf->download($filename);
    }

    /**
     * Preview the prescription as PDF in browser.
     */
    public function show(Prescription $prescription, GeneratePrescriptionPdfAction $action)
    {
        $pdf = $action->execute($prescription);
        
        return $pdf->stream();
    }
}
