<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $admin = User::firstOrCreate(
            ['email' => 'admin@ngu.com'],
            ['name' => 'Admin Ngu', 'password' => Hash::make('password')],
        );
        $admin->assignRole('admin');

        $doctor = User::firstOrCreate(
            ['email' => 'doctor@ngu.com'],
            ['name' => 'Dr. Garcia', 'password' => Hash::make('password')],
        );
        $doctor->assignRole('doctor');

        $recep = User::firstOrCreate(
            ['email' => 'recep@ngu.com'],
            ['name' => 'Recep Ngu', 'password' => Hash::make('password')],
        );
        $recep->assignRole('receptionist');

        $this->call(DemoSeeder::class);
    }
}
