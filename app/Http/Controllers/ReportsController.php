<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Consultation;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    /**
     * Display the financial reports and stats.
     */
    public function index()
    {
        // Daily revenue for the last 30 days
        $dailyRevenue = Payment::where('status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->select(
                DB::raw('date(created_at) as date'),
                DB::raw('sum(amount) as total')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Stats summary
        $stats = [
            'total_revenue_month' => Payment::where('status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->sum('amount'),
            'total_payments_today' => Payment::where('status', 'paid')
                ->whereDate('created_at', now()->today())
                ->count(),
            'revenue_today' => Payment::where('status', 'paid')
                ->whereDate('created_at', now()->today())
                ->sum('amount'),
            'pending_amount' => Payment::where('status', 'pending')
                ->sum('amount'),
        ];

        // Revenue by payment method
        $paymentMethods = Payment::where('status', 'paid')
            ->select('payment_method', DB::raw('sum(amount) as total'))
            ->groupBy('payment_method')
            ->get();

        return Inertia::render('reports/index', [
            'dailyRevenue' => $dailyRevenue,
            'stats' => $stats,
            'paymentMethods' => $paymentMethods,
        ]);
    }
}
