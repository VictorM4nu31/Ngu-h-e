<?php

namespace Database\Seeders;

use App\Enums\AppointmentStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Appointment;
use App\Models\Consultation;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\Payment;
use App\Models\Prescription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Escenario demo completo y visible: staff, pacientes con expediente,
 * horarios de médicos, citas (hoy/mañana/ayer), consultas con recetas
 * y pagos. Todas las fechas son relativas a "hoy" para que el demo
 * siempre se vea vivo. Re-ejecutable sin duplicar (firstOrCreate).
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $today = Carbon::today();

        $doctors = [
            $this->staff('Dr. Garcia', 'doctor@ngu.com', 'doctor'),
            $this->staff('Dra. Morales', 'dra.morales@ngu.com', 'doctor'),
        ];
        $this->staff('Admin Ngu', 'admin@ngu.com', 'admin');
        $this->staff('Recep Ngu', 'recep@ngu.com', 'receptionist');

        foreach ($doctors as $doctor) {
            $this->schedule($doctor);
        }

        $patients = [
            $this->patient('María Hernández', 'maria.h@ngu.com', [
                'document_id' => 'HID-1001',
                'birth_date' => '1988-04-12',
                'gender' => 'female',
                'phone' => '5551010101',
                'email' => 'maria.h@ngu.com',
                'address' => 'Av. Juárez 123, Ixmiquilpan',
                'allergies' => 'Penicilina',
                'chronic_diseases' => 'Hipertensión',
                'current_medication' => 'Losartán 50mg diario',
            ]),
            $this->patient('Juan Pérez', 'juan.p@ngu.com', [
                'document_id' => 'HID-1002',
                'birth_date' => '1975-09-03',
                'gender' => 'male',
                'phone' => '5552020202',
                'email' => 'juan.p@ngu.com',
                'address' => 'Calle Allende 45, Cardonal',
                'medical_antecedents' => 'Padre con diabetes tipo 2.',
            ]),
            $this->patient('Ana López', 'ana.l@ngu.com', [
                'document_id' => 'HID-1003',
                'birth_date' => '2001-01-25',
                'gender' => 'female',
                'phone' => '5553030303',
                'email' => 'ana.l@ngu.com',
                'address' => 'Barrio Progreso 8, Tasquillo',
                'allergies' => 'Polen',
            ]),
            $this->patient('Carlos Ruiz', null, [
                'document_id' => 'HID-1004',
                'birth_date' => '1995-11-30',
                'gender' => 'male',
                'phone' => '5554040404',
                'address' => 'Centro, Actopan',
                'chronic_diseases' => 'Asma',
                'current_medication' => 'Salbutamol según necesidad',
            ]),
        ];

        // Citas de hoy (visibles en dashboards y agenda).
        $this->appointment($patients[0], $doctors[0], $today->copy()->setTime(10, 0), 'scheduled', 'Chequeo general');
        $this->appointment($patients[1], $doctors[1], $today->copy()->setTime(11, 30), 'confirmed', 'Seguimiento hipertensión');

        // Citas de mañana (recordatorio scheduler + agenda).
        $this->appointment($patients[2], $doctors[0], $today->copy()->addDay()->setTime(9, 30), 'scheduled', 'Control anual');
        $this->appointment($patients[3], $doctors[1], $today->copy()->addDay()->setTime(12, 0), 'confirmed', 'Revisión asma');

        // Historial: ayer completada + cancelada.
        $done = $this->appointment($patients[0], $doctors[1], $today->copy()->subDay()->setTime(10, 0), 'completed', 'Dolor de cabeza');
        $this->appointment($patients[1], $doctors[0], $today->copy()->subDay()->setTime(12, 0), 'cancelled', 'Lumbalgia');

        // Consulta con receta y pago (ayer) → timeline, recetas PDF, reportes.
        $consultation = Consultation::firstOrCreate(
            ['patient_id' => $patients[0]->id, 'doctor_id' => $doctors[1]->id, 'appointment_id' => $done->id],
            [
                'weight' => 68.5,
                'height' => 162,
                'temperature' => 36.7,
                'bp_systolic' => 120,
                'bp_diastolic' => 80,
                'heart_rate' => 72,
                'reason_for_visit' => 'Dolor de cabeza recurrente',
                'clinical_findings' => 'Sin signos de alarma. TA normal.',
                'diagnosis' => 'Cefalea tensional',
                'treatment_plan' => 'Higiene del sueño y control en 2 semanas.',
            ]
        );

        Prescription::firstOrCreate(
            ['consultation_id' => $consultation->id],
            [
                'patient_id' => $patients[0]->id,
                'doctor_id' => $doctors[1]->id,
                'items' => [
                    ['medication' => 'Paracetamol', 'dosage' => '500mg', 'frequency' => 'Cada 8 horas', 'duration' => 'Por 5 días'],
                    ['medication' => 'Ibuprofeno', 'dosage' => '400mg', 'frequency' => 'Cada 12 horas', 'duration' => 'Por 3 días'],
                ],
                'general_instructions' => 'Tomar con alimentos. Acudir si el dolor empeora.',
            ]
        );

        Payment::firstOrCreate(
            ['consultation_id' => $consultation->id],
            [
                'patient_id' => $patients[0]->id,
                'amount' => 350.00,
                'payment_method' => PaymentMethod::Cash,
                'status' => PaymentStatus::Paid,
                'notes' => 'Cobro automático de consulta',
            ]
        );

        // Segundo pago standalone (tarjeta, pendiente) para variedad en reportes.
        Payment::firstOrCreate(
            ['patient_id' => $patients[1]->id, 'consultation_id' => null, 'amount' => 500.00],
            [
                'payment_method' => PaymentMethod::Card,
                'status' => PaymentStatus::Pending,
                'notes' => 'Anticipo de tratamiento',
            ]
        );
    }

    private function staff(string $name, string $email, string $role): User
    {
        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password')]
        );

        if (! $user->hasRole($role)) {
            $user->assignRole($role);
        }

        return $user;
    }

    /**
     * Crea (o recupera) un paciente demo, con usuario portal opcional.
     */
    private function patient(string $name, ?string $email, array $data): Patient
    {
        $user = null;

        if ($email !== null) {
            $user = User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => Hash::make('password')]
            );

            if (! $user->hasRole('patient')) {
                $user->assignRole('patient');
            }
        }

        return Patient::firstOrCreate(
            ['document_id' => $data['document_id']],
            array_merge(['full_name' => $name, 'user_id' => $user?->id], $data)
        );
    }

    private function schedule(User $doctor): void
    {
        // Lunes(1) a viernes(5) 09:00–18:00; fin de semana cerrado.
        for ($day = 0; $day < 7; $day++) {
            DoctorSchedule::updateOrCreate(
                ['user_id' => $doctor->id, 'day_of_week' => $day],
                [
                    'is_working' => $day >= 1 && $day <= 5,
                    'start_time' => '09:00',
                    'end_time' => '18:00',
                ]
            );
        }
    }

    private function appointment(Patient $patient, User $doctor, Carbon $start, string $status, string $reason): Appointment
    {
        return Appointment::firstOrCreate(
            [
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_time' => $start->copy()->setTimezone(config('app.timezone')),
            ],
            [
                'end_time' => $start->copy()->addMinutes(30)->setTimezone(config('app.timezone')),
                'status' => AppointmentStatus::from($status),
                'reason' => $reason,
            ]
        );
    }
}
