<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;

class DoctorController extends Controller
{
    /**
     * Display a listing of the staff members.
     */
    public function index()
    {
        $staff = User::role(['doctor', 'receptionist'])->with('roles')->get();

        return Inertia::render('doctors/index', [
            'staff' => $staff
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
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:doctor,receptionist',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->assignRole($request->role);

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
    public function update(Request $request, User $user)
    {
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('error', 'No se puede editar a un administrador.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:doctor,receptionist',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        // Sync role (remove old, assign new)
        $user->syncRoles([$request->role]);

        return redirect()->route('staff.index')->with('success', 'Personal actualizado correctamente.');
    }

    /**
     * Remove the specified staff member from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself or other admins through this controller
        if ($user->hasRole('admin')) {
            return redirect()->back()->with('error', 'No se puede eliminar a un administrador.');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Personal eliminado correctamente.');
    }
}
