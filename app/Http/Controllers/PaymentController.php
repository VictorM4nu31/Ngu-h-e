<?php

namespace App\Http\Controllers;

use App\Actions\Payments\CreatePaymentAction;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PaymentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Payment::with(['patient', 'consultation'])->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('patient', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            });
        }

        return Inertia::render('payments/index', [
            'payments' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, CreatePaymentAction $action)
    {
        $validated = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'consultation_id' => 'nullable|exists:consultations,id',
            'amount' => 'required|numeric|min:0',
            'payment_method' => ['required', Rule::enum(PaymentMethod::class)],
            'status' => ['required', Rule::enum(PaymentStatus::class)],
            'notes' => 'nullable|string',
        ]);

        $action->execute($validated);

        return redirect()->back()->with('success', 'Pago registrado correctamente.');
    }
}
