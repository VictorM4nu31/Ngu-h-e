<?php

namespace App\Actions\Prescriptions;

use App\Models\Prescription;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;

class GeneratePrescriptionPdfAction
{
    /**
     * Generate a PDF for the given prescription.
     *
     * @param Prescription $prescription
     * @return \Barryvdh\DomPDF\PDF
     */
    public function execute(Prescription $prescription)
    {
        $prescription->load(['patient', 'doctor']);
        
        return Pdf::loadView('reports.prescription', compact('prescription'));
    }
}
