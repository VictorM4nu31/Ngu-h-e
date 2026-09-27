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

class DemoDataSeeder extends Seeder
{
    /**
     * Seed a realistic clinic dataset: staff, patients (one linked to a portal
     * user), schedules, appointments across past/future, consultations with
     * vitals, prescriptions and payments.
     */
    public function run(): void
    {
        $today = Carbon::today();

        // ─── Staff ────────────────────────────────────────────────────────────
        $doctors = collect([
            ['name' => 'Dr. García', 'email' => 'doctor@ngu.com', 'professional_license' => '41872635'],
            ['name' => 'Dra. Ramírez', 'email' => 'dra.ramirez@ngu.com', 'professional_license' => '90247716'],
        ])->map(fn (array $data) => User::factory()->create($data)->assignRole('doctor'));

        User::factory()->create([
            'name' => 'Admin Ngu',
            'email' => 'admin@ngu.com',
        ])->assignRole('admin');

        User::factory()->create([
            'name' => 'Recep Ngu',
            'email' => 'recep@ngu.com',
        ])->assignRole('receptionist');

        $primaryDoctor = $doctors[0];

        // Horarios de atención: lunes a viernes, más sábado en el segundo doctor.
        foreach ($doctors as $index => $doctor) {
            $days = $index === 0 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6];
            foreach ($days as $day) {
                DoctorSchedule::create([
                    'user_id' => $doctor->id,
                    'day_of_week' => $day,
                    'start_time' => $index === 0 ? '09:00:00' : '10:00:00',
                    'end_time' => $index === 0 ? '14:00:00' : '16:00:00',
                    'is_working' => true,
                ]);
            }
        }

        // ─── Patients ─────────────────────────────────────────────────────────
        $patientSeeds = [
            ['Ana Sofía Ramírez Cruz', 'female', '1991-03-14', '+52 55 4821 3390', 'Hipertensión arterial controlada. Antecedente de cesárea (2018).'],
            ['Miguel Ángel Torres Vega', 'male', '1984-11-02', '+52 55 2019 7741', 'Diabetes mellitus tipo 2. Fumador activo.'],
            ['Lucía Fernanda Ríos Paz', 'female', '1996-07-23', '+52 55 7742 1180', null],
            ['Jorge Alberto Núñez Mora', 'male', '1972-01-30', '+52 55 3390 5528', 'Hipertensión, hipercolesterolemia. Alergia a penicilina.'],
            ['Patricia Elena Guzmán Luna', 'female', '1988-05-19', '+52 55 1180 6624', null],
            ['Ricardo Andrés Delgado Solís', 'male', '1999-09-08', '+52 55 5528 4417', 'Asma leve. En tratamiento con inhalador de rescate.'],
            ['María Fernanda Ortiz Peña', 'female', '1965-12-11', '+52 55 4417 9903', 'Diabetes tipo 2, retinopatía incipiente.'],
            ['Carlos Eduardo Bautista Rey', 'male', '1993-02-27', '+52 55 9903 3358', null],
            ['Daniela Montserrat Ibarra Fuentes', 'female', '2001-08-05', '+52 55 2214 7702', 'Rinitis alérgica estacional.'],
            ['Héctor Manuel Rivera Campos', 'male', '1978-06-17', '+52 55 7702 5519', 'Hipertensión arterial. Tabaquismo.'],
            ['Gabriela Monserrat Espinoza Ríos', 'female', '1994-04-09', '+52 55 5519 8830', null],
            ['Sergio Alejandro Márquez Lara', 'male', '1981-10-21', '+52 55 8830 4426', 'Gastritis crónica. Reflujo gastroesofágico.'],
        ];

        $patients = collect($patientSeeds)->map(function (array $seed, int $index) {
            return Patient::create([
                'full_name' => $seed[0],
                'document_id' => 'CURP'.str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT).'RFCX',
                'birth_date' => $seed[2],
                'gender' => $seed[1],
                'phone' => $seed[3],
                'email' => str($seed[0])->slug('.')->append('@correo.com')->toString(),
                'address' => fake()->address(),
                'medical_antecedents' => $seed[4],
                'allergies' => str_contains((string) $seed[4], 'Alergia') ? 'Penicilina' : null,
                'chronic_diseases' => str_contains((string) $seed[4], 'Diabetes') ? 'Diabetes mellitus tipo 2' : (str_contains((string) $seed[4], 'Hipertensión') ? 'Hipertensión arterial' : null),
                'current_medication' => str_contains((string) $seed[4], 'Hipertensión') ? 'Losartán 50 mg / 24 h' : null,
            ]);
        });

        // El primer paciente queda enlazado a un usuario del portal (rol patient).
        $portalUser = User::factory()->create([
            'name' => 'Ana Sofía Ramírez',
            'email' => 'paciente@ngu.com',
            'password' => Hash::make('password'),
        ]);
        $portalUser->assignRole('patient');
        $patients[0]->update(['user_id' => $portalUser->id, 'email' => $portalUser->email]);

        // ─── Appointments ──────────────────────────────────────────────────────
        $reasons = [
            'Control de presión arterial', 'Revisión de glucosa en ayunas',
            'Dolor de garganta y fiebre', 'Control de diabetes trimestral',
            'Revisión deResultados de laboratorio', 'Dolores musculares en espalda baja',
            'Chequeo general preventivo', 'Alergia respiratoria recurrente',
            'Control de colesterol y tensión', 'Cefalea tensional',
            'Seguimiento de gastritis', 'Consulta de nutrición y hábitos',
        ];

        $appointments = collect();

        // Citas pasadas (ya completadas) — 24 en las últimas 8 semanas.
        for ($i = 0; $i < 24; $i++) {
            $day = $today->copy()->subDays(56 - $i * 2);
            $start = $day->copy()->setTime(9, 0)->addMinutes(($i % 8) * 30);
            $patient = $patients[$i % $patients->count()];
            $doctor = $doctors[$i % $doctors->count()];

            $appointments->push(Appointment::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_time' => $start,
                'end_time' => $start->copy()->addMinutes(30),
                'status' => AppointmentStatus::Completed,
                'reason' => $reasons[$i % count($reasons)],
                'reminder_sent_at' => $start->copy()->subDay(),
            ]));
        }

        // Citas de hoy — las que ve el dashboard.
        $todayAppointments = collect();
        for ($slot = 0; $slot < 6; $slot++) {
            $start = $today->copy()->setTime(9, 0)->addMinutes($slot * 40);
            $patient = $patients[($slot + 2) % $patients->count()];
            $doctor = $slot < 4 ? $primaryDoctor : $doctors[1];

            $appointment = Appointment::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_time' => $start,
                'end_time' => $start->copy()->addMinutes(30),
                'status' => $slot < 2 ? AppointmentStatus::Completed : ($slot < 4 ? AppointmentStatus::Confirmed : AppointmentStatus::Scheduled),
                'reason' => $reasons[$slot % count($reasons)],
            ]);

            $appointments->push($appointment);
            $todayAppointments->push($appointment);
        }

        // Citas futuras (agenda del doctor y portal del paciente).
        for ($i = 0; $i < 14; $i++) {
            $day = $today->copy()->addDays($i + 1);
            $start = $day->copy()->setTime(9, 0)->addMinutes(($i % 8) * 30);
            $patient = $patients[($i + 5) % $patients->count()];
            $doctor = $doctors[$i % $doctors->count()];

            $appointments->push(Appointment::create([
                'patient_id' => $patient->id,
                'doctor_id' => $doctor->id,
                'start_time' => $start,
                'end_time' => $start->copy()->addMinutes(30),
                'status' => $i % 3 === 0 ? AppointmentStatus::Confirmed : AppointmentStatus::Scheduled,
                'reason' => $reasons[$i % count($reasons)],
            ]));
        }

        // Una cita cancelada y una sin asistir, para variar los estados.
        Appointment::create([
            'patient_id' => $patients[3]->id,
            'doctor_id' => $primaryDoctor->id,
            'start_time' => $today->copy()->subDays(4)->setTime(11, 0),
            'end_time' => $today->copy()->subDays(4)->setTime(11, 30),
            'status' => AppointmentStatus::Cancelled,
            'reason' => 'Revisión de hipertensión',
        ]);
        Appointment::create([
            'patient_id' => $patients[5]->id,
            'doctor_id' => $primaryDoctor->id,
            'start_time' => $today->copy()->subDays(7)->setTime(10, 0),
            'end_time' => $today->copy()->subDays(7)->setTime(10, 30),
            'status' => AppointmentStatus::NoShow,
            'reason' => 'Control de asma',
        ]);

        // ─── Portal del paciente: historial propio más denso ───────────────────
        // The portal user is patients[0]; give them a full clinical history so
        // "Mis citas" / "Mis recetas" have something meaningful to show.
        $portalPatient = $patients[0];
        $portalHistory = [
            ['Control de presión arterial', 'Hipertensión arterial estable'],
            ['Cefalea tensional', 'Cefalea tensional primaria'],
            ['Control de peso y signos vitales', 'Consulta de rutina sin hallazgos patológicos'],
            ['Revisión de resultados de laboratorio', 'Perfil lipídico dentro de rango'],
            ['Alergia respiratoria recurrente', 'Rinitis alérgica estacional'],
        ];

        foreach ($portalHistory as $i => [$reason, $diagnosis]) {
            $start = $today->copy()->subDays(48 - $i * 11)->setTime(10, 0);
            $doctor = $doctors[$i % $doctors->count()];

            $appointment = Appointment::create([
                'patient_id' => $portalPatient->id,
                'doctor_id' => $doctor->id,
                'start_time' => $start,
                'end_time' => $start->copy()->addMinutes(30),
                'status' => AppointmentStatus::Completed,
                'reason' => $reason,
                'reminder_sent_at' => $start->copy()->subDay(),
            ]);
            $appointments->push($appointment);

            $consultation = Consultation::create([
                'patient_id' => $portalPatient->id,
                'doctor_id' => $doctor->id,
                'appointment_id' => $appointment->id,
                'weight' => 64.5,
                'height' => 1.63,
                'temperature' => 36.6,
                'bp_systolic' => 124 + $i,
                'bp_diastolic' => 78 + $i,
                'heart_rate' => 72,
                'respiratory_rate' => 16,
                'oxygen_saturation' => 98,
                'reason_for_visit' => $reason,
                'clinical_findings' => 'Paciente en buen estado general. Signos vitales dentro de parámetros aceptables.',
                'diagnosis' => $diagnosis,
                'treatment_plan' => 'Continuar tratamiento actual. Control en 3 meses.',
                'created_at' => $start,
                'updated_at' => $start,
            ]);

            Prescription::create([
                'consultation_id' => $consultation->id,
                'patient_id' => $portalPatient->id,
                'doctor_id' => $doctor->id,
                'items' => [
                    ['medication' => 'Losartán', 'dosage' => '50 mg', 'frequency' => 'Cada 24 horas', 'duration' => '30 días'],
                    ['medication' => 'Ácido fólico', 'dosage' => '5 mg', 'frequency' => 'Cada 24 horas', 'duration' => '30 días'],
                ],
                'general_instructions' => 'Mantener una dieta baja en sodio y actividad física regular. Acudir a consulta si presenta mareos o cefalea intensa.',
                'created_at' => $start,
                'updated_at' => $start,
            ]);
        }

        // Próximas citas del portal, incluidas una para hoy.
        foreach ([[0, 12, 30], [2, 11, 0], [6, 9, 30], [11, 10, 0]] as [$offsetDays, $hour, $minute]) {
            $start = $today->copy()->addDays($offsetDays)->setTime($hour, $minute);

            $appointments->push(Appointment::create([
                'patient_id' => $portalPatient->id,
                'doctor_id' => $offsetDays % 2 === 0 ? $primaryDoctor->id : $doctors[1]->id,
                'start_time' => $start,
                'end_time' => $start->copy()->addMinutes(30),
                'status' => $offsetDays === 0 ? AppointmentStatus::Confirmed : AppointmentStatus::Scheduled,
                'reason' => $reasons[$offsetDays % count($reasons)],
            ]));
        }

        // ─── Consultations + Prescriptions + Payments ──────────────────────────
        $clinicalCases = [
            ['Cefalea tensional', 'Cefalea opresiva frontal bilateral, sin déficit neurológico.', 'Cefalea tensional primaria', 'Paracetamol 500 mg c/8h por 5 días. Evitar pantallas 4 h. Hidratación adecuada.'],
            ['Diabetes mellitus tipo 2 descompensada', 'Glucosa en ayunas 186 mg/dL. Poliuria y polidipsia leve.', 'Diabetes mellitus tipo 2 fuera de rango', 'Metformina 850 mg c/12h. Insulinoterapia basal si persiste >180 mg/dL. Consulta con nutriología.'],
            ['Hipertensión arterial etapa 1', 'Presión 148/94 mmHg, sin síntomas.', 'Hipertensión arterial etapa 1', 'Losartán 50 mg c/24h. Restricción de sodio. Registro domiciliario de presión.'],
            ['Infección de vías respiratorias superiores', 'Fiebre 38.2 °C, faringe eritematosa, adenopatías cervicales.', 'Faringoamigdalitis viral', 'Paracetamol 500 mg c/6h. Ibuprofeno 400 mg c/8h. Hidratación. Reposo 3 días.'],
            ['Control de consulta médica', 'Paciente asintomático; controles de rutina dentro de parámetros normales.', 'Consulta de rutina sin hallazgos patológicos', 'Mantener estilo de vida activo. Próximo control en 6 meses.'],
            ['Dolor lumbar mecánico', 'Lumbalgia discal L4-L5 sin irradiación.', 'Lumbalgia mecánica', 'Naproxeno 250 mg c/12h. Fisioterapia. Evitar cargas mayores a 10 kg.'],
            ['Asma bronquial leve persistente', 'Sibilancias ocasionales, espiración sibilante.', 'Asma leve persistente', 'Salbutamol inhalador 2 puff PRN. Montelukast 10 mg c/24h.'],
            ['Gastritis crónica con reflujo', 'Epigastralia posprandial y pirosis.', 'ERGE y gastritis crónica', 'Omeprazol 20 mg c/12h × 8 semanas. Evitar grasas y AINE.'],
        ];

        $completed = $appointments->filter(fn (Appointment $a) => $a->status === AppointmentStatus::Completed);

        $completed->each(function (Appointment $appointment, int $index) use ($clinicalCases) {
            $case = $clinicalCases[$index % count($clinicalCases)];

            // Clinical records are filed the same day as the visit, so the
            // revenue/report charts have a realistic spread over time.
            $visitedAt = $appointment->start_time->copy();

            $consultation = Consultation::create([
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'appointment_id' => $appointment->id,
                'weight' => fake()->randomFloat(1, 48, 102),
                'height' => fake()->randomFloat(0, 1.48, 1.86),
                'temperature' => fake()->randomFloat(1, 36.1, 38.4),
                'bp_systolic' => fake()->numberBetween(108, 156),
                'bp_diastolic' => fake()->numberBetween(68, 96),
                'heart_rate' => fake()->numberBetween(58, 104),
                'respiratory_rate' => fake()->numberBetween(14, 22),
                'oxygen_saturation' => fake()->numberBetween(95, 99),
                'reason_for_visit' => $appointment->reason,
                'clinical_findings' => $case[1],
                'diagnosis' => $case[2],
                'treatment_plan' => $case[3],
                'created_at' => $visitedAt,
                'updated_at' => $visitedAt,
            ]);

            Prescription::create([
                'consultation_id' => $consultation->id,
                'patient_id' => $appointment->patient_id,
                'doctor_id' => $appointment->doctor_id,
                'items' => [
                    ['medication' => 'Paracetamol', 'dosage' => '500 mg', 'frequency' => 'Cada 8 horas', 'duration' => '5 días'],
                    ['medication' => 'Ibuprofeno', 'dosage' => '400 mg', 'frequency' => 'Cada 8 horas', 'duration' => '3 días'],
                ],
                'general_instructions' => 'Mantener buena hidratación y descansar. Acudir a consulta si los síntomas empeoran o aparece fiebre mayor a 39 °C.',
                'created_at' => $visitedAt,
                'updated_at' => $visitedAt,
            ]);

            if ($index % 4 !== 3) {
                // Weight payment methods deliberately so the donut chart in the
                // financial report has all three slices populated.
                $method = match ($index % 3) {
                    0 => PaymentMethod::Card,
                    1 => PaymentMethod::Cash,
                    default => PaymentMethod::Transfer,
                };

                Payment::create([
                    'patient_id' => $appointment->patient_id,
                    'consultation_id' => $consultation->id,
                    'amount' => match ($index % 4) {
                        0 => 850.00,
                        1 => 500.00,
                        2 => 650.00,
                        default => 1200.00,
                    },
                    'payment_method' => $method,
                    'status' => $index % 7 === 0 ? PaymentStatus::Pending : PaymentStatus::Paid,
                    'created_at' => $visitedAt,
                    'updated_at' => $visitedAt,
                ]);
            }
        });

        // ─── Notificaciones de demo para el admin ──────────────────────────────
        $admin = User::role('admin')->first();
        $sample = $appointments->take(4);
        foreach ($sample as $appointment) {
            $admin->notify(new \App\Notifications\AppointmentStatusChanged(
                $appointment->load(['patient', 'doctor']),
                null,
                'Recep Ngu',
            ));
        }
    }
}
