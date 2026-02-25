<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $admin = User::factory()->create([
            'name' => 'Admin Ngu',
            'email' => 'admin@ngu.com',
        ]);
        $admin->assignRole('admin');

        $doctor = User::factory()->create([
            'name' => 'Dr. Garcia',
            'email' => 'doctor@ngu.com',
        ]);
        $doctor->assignRole('doctor');

        $recep = User::factory()->create([
            'name' => 'Recep Ngu',
            'email' => 'recep@ngu.com',
        ]);
        $recep->assignRole('receptionist');
    }
}
