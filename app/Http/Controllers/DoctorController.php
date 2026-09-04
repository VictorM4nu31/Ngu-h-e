<?php

namespace App\Http\Controllers;

use App\Http\Requests\Doctors\StoreDoctorRequest;
use App\Http\Requests\Doctors\UpdateDoctorRequest;
use App\Models\Consultation;
use App\Models\Prescription;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DoctorController extends Controller
{
    /**
     * Display a listing of the staff members.
     */
    public function index(Request $request)
    {
        $staff = User::role(['doctor', 'receptionist'])
            ->with('roles')
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('doctors/index', [
            'staff' => $staff,
        ]);
    }

    /**
     * Show the form for creating a new staff member.
     */
    public function create()
    {
        return Inertia::render('doctors/create');
    }

    /**
     * Store a newly created staff member in storage.
     */
    public function store(StoreDoctorRequest $request)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('staff.index')->with('success', 'Personal registrado correctamente.');
    }

    /**
     * Show the form for editing a staff member.
     */
    public function edit(User $user)
    {
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('error', 'No se puede editar a un administrador desde aquí.');
        }

        return Inertia::render('doctors/edit', [
            'member' => array_merge($user->toArray(), [
                'role' => $user->roles->first()?->name ?? 'doctor',
            ]),
        ]);
    }

    /**
     * Update the specified staff member in storage.
     */
    public function update(UpdateDoctorRequest $request, User $user)
    {
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('error', 'No se puede editar a un administrador.');
        }

        $validated = $request->validated();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => $validated['password']]);
        }

        // Sync role (remove old, assign new)
        $user->syncRoles([$validated['role']]);

        return redirect()->route('staff.index')->with('success', 'Personal actualizado correctamente.');
    }

    /**
     * Remove the specified staff member from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if (auth()->id() === $user->id) {
            return redirect()->back()->with('error', 'No puedes eliminar tu propia cuenta.');
        }

        // Prevent deleting other admins through this controller
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('error', 'No se puede eliminar a un administrador.');
        }

        // Check if doctor has consultations or prescriptions
        $hasConsultations = Consultation::where('doctor_id', $user->id)->exists();
        $hasPrescriptions = Prescription::where('doctor_id', $user->id)->exists();

        if ($hasConsultations || $hasPrescriptions) {
            return redirect()->back()->with('error', 'No se puede eliminar a este miembro del personal porque tiene historiales clínicos (consultas o recetas) vinculados. Por favor, desactívelo en su lugar.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Personal eliminado correctamente.');
    }
}
