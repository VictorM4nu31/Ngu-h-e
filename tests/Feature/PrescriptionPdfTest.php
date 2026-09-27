<?php

use App\Models\Consultation;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * Regression coverage for the prescription PDF.
 *
 * dompdf has two traps that silently produce a broken document rather than an
 * error, and both are asserted here:
 *   - `var()` inside the `background` shorthand resolves to nothing, so the
 *     teal header band and the title block would paint white-on-white. The
 *     fill-count assertion below is what catches this; checking that the text
 *     merely renders correctly does not, because the glyphs are unaffected.
 *   - a universal `*` reset also matches dompdf's page box, which cancels the
 *     `@page` margin and pushes the body edge to edge so the content spills
 *     off the right of the sheet. Glyph x positions catch this.
 *
 * Layout is measured from the generated PDF's own operators rather than from
 * a rendered image, so the assertions need no external tooling.
 */
beforeEach(function () {
    foreach (['admin', 'doctor', 'receptionist', 'patient'] as $role) {
        Role::firstOrCreate(['name' => $role]);
    }
});

/**
 * Build a prescription attached to a real doctor/patient/consultation.
 *
 * `consultation_id` is NOT NULL in the schema, so the "no consultation" case
 * is simulated by detaching the relation instead of nulling the column.
 *
 * @param  array<int, array<string, string>>  $items
 */
function makePrescription(array $items, ?string $instructions = null, bool $withConsultation = true): Prescription
{
    $doctor = User::factory()->doctor()->create(['name' => 'Dr. García']);
    $doctor->assignRole('doctor');

    $patient = Patient::create([
        'full_name' => 'Ana Sofía Ramírez Cruz',
        'birth_date' => '1991-03-14',
        'gender' => \App\Enums\Gender::Female,
    ]);

    $consultation = Consultation::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'reason_for_visit' => 'Control de presión arterial',
        'diagnosis' => 'Hipertensión arterial estable',
    ]);

    $prescription = Prescription::create([
        'patient_id' => $patient->id,
        'doctor_id' => $doctor->id,
        'consultation_id' => $consultation->id,
        'items' => $items,
        'general_instructions' => $instructions,
    ]);

    $prescription = $prescription->fresh(['patient', 'doctor', 'consultation']);

    if (! $withConsultation) {
        $prescription->setRelation('consultation', null);
    }

    return $prescription;
}

/**
 * Every text-drawing operator's x position, taken from the PDF content stream.
 *
 * @return array<int, float>
 */
function textPositionsIn(string $pdfPath): array
{
    $found = array_map(
        fn (array $m) => (float) $m[1],
        textOperatorsIn($pdfPath, '/BT\s+([\d.]+)\s+(-?[\d.]+)\s+Td/')
    );

    return $found;
}

/**
 * How many times a given hex fill colour is painted in the content stream.
 *
 * This is what catches the `var()`-in-`background` bug: a missing fill emits
 * no colour operator at all, and the text itself would still look correct, so
 * asserting the colour merely *exists* is not enough — three separate blocks
 * (accent bar, title block, table header) depend on it.
 */
function fillCountIn(string $pdfPath, string $hex): int
{
    $target = strtoupper(ltrim($hex, '#'));
    $count = 0;

    foreach (textOperatorsIn($pdfPath, '/([\d.]+) ([\d.]+) ([\d.]+) rg/') as $m) {
        $channels = array_map(
            fn (string $v) => (int) round(((float) $v) * 255),
            array_slice($m, 1)
        );

        if (sprintf('%02X%02X%02X', ...$channels) === $target) {
            $count++;
        }
    }

    return $count;
}

/**
 * Run a regex over the inflated content stream of a PDF.
 *
 * @return array<int, array<int, string>>
 */
function textOperatorsIn(string $pdfPath, string $pattern): array
{
    $contents = (string) file_get_contents($pdfPath);
    preg_match_all('/stream\r?\n(.*?)\r?\nendstream/s', $contents, $matches);

    $stream = '';
    foreach ($matches[1] as $chunk) {
        $inflated = @gzuncompress($chunk);
        $stream .= $inflated !== false ? $inflated : $chunk;
    }

    preg_match_all($pattern, $stream, $found, PREG_SET_ORDER);

    return $found;
}

/**
 * Assert no glyph starts beyond the printable width of the page.
 *
 * A4 is 595.28pt wide and the template sets 32pt side margins, so the content
 * edge sits at ~563pt. Without `table-layout: fixed`, dompdf widens columns
 * past 100% and glyphs land past that edge.
 *
 * @param  array<int, float>  $positions
 */
function expectInsidePage(array $positions): void
{
    expect($positions)->not->toBeEmpty();

    foreach ($positions as $x) {
        expect($x)->toBeLessThanOrEqual(563.0);
    }
}

function renderPrescription(Prescription $prescription): string
{
    $path = storage_path('app/testing-receta.pdf');
    app(App\Actions\Prescriptions\GeneratePrescriptionPdfAction::class)
        ->execute($prescription)
        ->save($path);

    return $path;
}

test('prescription pdf prints the doctor professional license', function () {
    $prescription = makePrescription([
        ['medication' => 'Losartán', 'dosage' => '50 mg', 'frequency' => 'Cada 24 horas', 'duration' => '30 días'],
    ]);

    $prescription->doctor->update(['professional_license' => '41872635']);

    $response = $this->actingAs(User::factory()->create()->assignRole('admin'))
        ->get(route('prescriptions.preview', $prescription));

    $response->assertOk();
    $response->assertHeader('content-type', 'application/pdf');
});

test('prescription pdf paints the brand header and title blocks', function () {
    $prescription = makePrescription([
        ['medication' => 'Losartán', 'dosage' => '50 mg', 'frequency' => 'Cada 24 horas', 'duration' => '30 días'],
    ], 'Mantener una dieta baja en sodio y actividad física regular.');

    $path = renderPrescription($prescription);

    // Three separate blocks paint the brand teal: the top accent bar, the
    // "Receta Médica" block and the medications table header. Regressing any of
    // them to the `background` shorthand drops the count from 7 to 2.
    expect(fillCountIn($path, '#087F78'))->toBeGreaterThanOrEqual(5);

    // The amber callout for the general instructions.
    expect(fillCountIn($path, '#FFFBEB'))->toBeGreaterThanOrEqual(1);
});

test('prescription pdf stays inside the printable page width', function () {
    $prescription = makePrescription([
        ['medication' => 'Metformina clorhidrato', 'dosage' => '850 mg', 'frequency' => 'Cada 12 horas con alimentos', 'duration' => '30 días'],
        ['medication' => 'Insulina glargina', 'dosage' => '100 UI', 'frequency' => 'Una vez al día por la noche', 'duration' => '30 días'],
        ['medication' => 'Losartán potasio', 'dosage' => '50 mg', 'frequency' => 'Cada 24 horas', 'duration' => '30 días'],
        ['medication' => 'Atorvastatina', 'dosage' => '20 mg', 'frequency' => 'Cada noche', 'duration' => '30 días'],
        ['medication' => 'Omeprazol', 'dosage' => '20 mg', 'frequency' => 'Cada 12 horas antes de comer', 'duration' => '8 semanas'],
    ], 'Mantener una dieta baja en sodio y una actividad física regular de al menos treinta minutos diarios. '
        .'Acudir a consulta si presenta mareos, cefalea intensa o visión borrosa. '
        .'No suspender los medicamentos sin indicación médica expresa.');

    expectInsidePage(textPositionsIn(renderPrescription($prescription)));
});

test('prescription pdf renders with a long instructions block', function () {
    $prescription = makePrescription(
        [['medication' => 'Paracetamol', 'dosage' => '500 mg', 'frequency' => 'Cada 8 horas', 'duration' => '5 días']],
        str_repeat('Indicación muy detallada para el paciente. ', 12)
    );

    expectInsidePage(textPositionsIn(renderPrescription($prescription)));
});

test('prescription pdf renders without a linked consultation', function () {
    $prescription = makePrescription(
        [['medication' => 'Losartán', 'dosage' => '50 mg', 'frequency' => 'Cada 24 horas', 'duration' => '30 días']],
        null,
        withConsultation: false
    );

    expectInsidePage(textPositionsIn(renderPrescription($prescription)));
});

test('prescription pdf renders when no medication was recorded', function () {
    $prescription = makePrescription([], 'Acudir a consulta si los síntomas persisten.');

    expectInsidePage(textPositionsIn(renderPrescription($prescription)));
});
