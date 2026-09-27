<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Receta Médica - {{ $prescription->patient->full_name }}</title>
    <style>
        /**
         * dompdf constraints that shape this stylesheet:
         * - layout is built with <table>, not flex/grid
         * - custom properties must be used through the `background-color`
         *   longhand: dompdf silently drops `var()` inside the `background`
         *   shorthand, which leaves coloured blocks unpainted
         * - the element reset below lists selectors explicitly on purpose. A
         *   universal `*` reset also matches dompdf's page box and cancels the
         *   `@page` margin, which runs the body edge to edge
         * - no box-shadow; depth comes from 1pt borders and tinted fills
         * - Helvetica is a core PDF font, so it renders identically
         *   everywhere without embedding a font file
         */
        @page {
            margin: 26pt 32pt 78pt 32pt;
        }

        :root {
            --brand: #087f78;
            --brand-dark: #05615d;
            --brand-tint: #f0faf9;
            --ink: #14312f;
            --muted: #5f7a78;
            --line: #d5e8e6;
            --warn-ink: #92400e;
            --warn-bg: #fffbeb;
            --warn-line: #fcd34d;
        }

        div,
        table,
        th,
        td,
        h1,
        p,
        span {
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 10pt;
            color: var(--ink);
            line-height: 1.4;
        }

        table {
            table-layout: fixed;
            border-collapse: collapse;
            word-wrap: break-word;
        }

        /* ── Masthead ─────────────────────────────────────────────────────── */
        .accent-bar {
            width: 100%;
            height: 5pt;
            background-color: var(--brand);
        }

        .masthead {
            width: 100%;
            padding: 13pt 0 11pt 0;
        }

        .masthead td {
            vertical-align: middle;
        }

        .brand-cell {
            width: 62pt;
        }

        .brand-logo {
            width: 52pt;
            height: 52pt;
        }

        .clinic-name {
            font-size: 16pt;
            font-weight: bold;
            color: var(--brand-dark);
            letter-spacing: 0.3pt;
            line-height: 1.1;
        }

        .clinic-tagline {
            font-size: 8pt;
            color: var(--muted);
            letter-spacing: 1.5pt;
            text-transform: uppercase;
            padding-top: 3pt;
        }

        .clinic-license {
            font-size: 7.5pt;
            color: var(--muted);
            padding-top: 4pt;
        }

        .doc-cell {
            width: 148pt;
            text-align: right;
            background-color: var(--brand);
            padding: 9pt 12pt 9pt 10pt;
        }

        .doc-badge {
            font-size: 8.5pt;
            font-weight: bold;
            color: #ffffff;
            letter-spacing: 1.2pt;
        }

        .doc-ref {
            font-size: 7.5pt;
            color: #bfe6e2;
            padding-top: 4pt;
        }

        /* ── Patient identity card ────────────────────────────────────────── */
        .identity {
            width: 100%;
            margin-top: 12pt;
            background-color: var(--brand-tint);
            border: 1pt solid var(--line);
            border-left: 3pt solid var(--brand);
        }

        .identity td {
            padding: 8pt 9pt;
            vertical-align: top;
        }

        .field-label {
            font-size: 7pt;
            font-weight: bold;
            color: var(--muted);
            letter-spacing: 0.8pt;
            text-transform: uppercase;
        }

        .field-value {
            font-size: 10pt;
            font-weight: bold;
            color: var(--ink);
            padding-top: 2pt;
        }

        /* ── Clinical summary ─────────────────────────────────────────────── */
        .summary {
            width: 100%;
            margin-top: 10pt;
            border: 1pt solid var(--line);
        }

        .summary th {
            width: 78pt;
            background-color: var(--brand-tint);
            color: var(--brand-dark);
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 0.8pt;
            text-transform: uppercase;
            text-align: left;
            padding: 5pt 9pt;
            border-bottom: 1pt solid var(--line);
        }

        .summary td {
            padding: 5pt 9pt;
            font-size: 9.5pt;
            border-bottom: 1pt solid #eef5f4;
        }

        .summary tr:last-child th,
        .summary tr:last-child td {
            border-bottom: none;
        }

        /* ── Section heading ──────────────────────────────────────────────── */
        .section-head {
            width: 100%;
            margin-top: 15pt;
            border-bottom: 1.5pt solid var(--brand);
        }

        .section-head td {
            padding-bottom: 4pt;
        }

        .section-title {
            font-size: 9.5pt;
            font-weight: bold;
            color: var(--brand-dark);
            letter-spacing: 1.4pt;
            text-transform: uppercase;
        }

        .rp-mark {
            font-size: 14pt;
            font-weight: bold;
            font-style: italic;
            color: var(--brand);
        }

        /* ── Medications table ────────────────────────────────────────────── */
        .meds {
            width: 100%;
            margin-top: 9pt;
        }

        .meds th {
            background-color: var(--brand);
            color: #ffffff;
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 0.8pt;
            text-transform: uppercase;
            text-align: left;
            padding: 6pt 7pt;
        }

        .meds td {
            padding: 7pt;
            font-size: 9.5pt;
            border-bottom: 1pt solid var(--line);
            vertical-align: top;
        }

        .meds .c-num {
            width: 20pt;
        }

        .meds .c-drug {
            width: 27%;
            font-weight: bold;
        }

        .meds .c-dose {
            width: 17%;
        }

        .meds .c-freq {
            width: 30%;
        }

        .meds .c-dur {
            width: 15%;
        }

        .meds tbody .c-num {
            color: var(--muted);
            font-size: 8.5pt;
        }

        .meds tbody .c-dur {
            color: var(--muted);
        }

        /* ── Instructions callout ─────────────────────────────────────────── */
        .callout {
            width: 100%;
            margin-top: 12pt;
            background-color: var(--warn-bg);
            border: 1pt solid var(--warn-line);
            border-left: 3pt solid #f59e0b;
        }

        .callout td {
            padding: 9pt 11pt;
            font-size: 9.5pt;
            color: var(--warn-ink);
            font-style: italic;
        }

        .callout-label {
            font-style: normal;
            font-weight: bold;
        }

        /* ── Signature / footer ───────────────────────────────────────────── */
        .footer {
            position: fixed;
            bottom: 24pt;
            left: 0;
            right: 0;
        }

        .sign-row td {
            padding-top: 24pt;
            text-align: center;
            vertical-align: bottom;
        }

        .sign-line {
            width: 100%;
            border-top: 1pt solid #9db8b6;
        }

        .sign-name {
            font-size: 10pt;
            font-weight: bold;
            color: var(--ink);
            padding-top: 4pt;
        }

        .sign-meta {
            font-size: 7.5pt;
            color: var(--muted);
            padding-top: 1pt;
        }

        .legal {
            margin-top: 12pt;
            padding-top: 7pt;
            border-top: 1pt solid var(--line);
            font-size: 7pt;
            color: var(--muted);
            text-align: center;
        }
    </style>
</head>

<body>
    @php
        $months = [
            1 => 'enero', 2 => 'febrero', 3 => 'marzo', 4 => 'abril',
            5 => 'mayo', 6 => 'junio', 7 => 'julio', 8 => 'agosto',
            9 => 'septiembre', 10 => 'octubre', 11 => 'noviembre', 12 => 'diciembre',
        ];
        $issued = $prescription->created_at;
        $issuedOn = $issued->format('d') . ' de ' . $months[$issued->month] . ' de ' . $issued->format('Y');
        $folio = 'REC-' . str_pad((string) $prescription->id, 5, '0', STR_PAD_LEFT);
    @endphp

    <div class="accent-bar"></div>

    <table class="masthead">
        <tr>
            <td class="brand-cell">
                <img class="brand-logo" src="{{ public_path('logo.png') }}" alt="Ngu hñe">
            </td>
            <td>
                <div class="clinic-name">Ngu hñe</div>
                <div class="clinic-tagline">Casa de la Medicina</div>
                @if ($prescription->doctor->professional_license)
                    <div class="clinic-license">
                        Cédula Profesional {{ $prescription->doctor->professional_license }}
                    </div>
                @endif
            </td>
            <td class="doc-cell">
                <div class="doc-badge">Receta Médica</div>
                <div class="doc-ref">Folio {{ $folio }}</div>
            </td>
        </tr>
    </table>

    <table class="identity">
        <tr>
            <td style="width: 40%;">
                <div class="field-label">Paciente</div>
                <div class="field-value">{{ $prescription->patient->full_name }}</div>
            </td>
            <td style="width: 14%;">
                <div class="field-label">Edad</div>
                <div class="field-value">{{ $prescription->patient->birth_date?->age ?? '—' }} años</div>
            </td>
            <td style="width: 19%;">
                <div class="field-label">Sexo</div>
                <div class="field-value">{{ $prescription->patient->gender?->label() ?? '—' }}</div>
            </td>
            <td style="width: 27%;">
                <div class="field-label">Fecha de emisión</div>
                <div class="field-value">{{ $issuedOn }}</div>
            </td>
        </tr>
    </table>

    @if ($prescription->consultation?->reason_for_visit || $prescription->consultation?->diagnosis)
        <table class="summary">
            @if ($prescription->consultation->reason_for_visit)
                <tr>
                    <th>Motivo</th>
                    <td>{{ $prescription->consultation->reason_for_visit }}</td>
                </tr>
            @endif
            @if ($prescription->consultation->diagnosis)
                <tr>
                    <th>Diagnóstico</th>
                    <td>{{ $prescription->consultation->diagnosis }}</td>
                </tr>
            @endif
        </table>
    @endif

    <table class="section-head">
        <tr>
            <td><span class="section-title">Prescripción</span></td>
            <td style="text-align: right; width: 60pt;"><span class="rp-mark">Rp.</span></td>
        </tr>
    </table>

    <table class="meds">
        <thead>
            <tr>
                <th class="c-num">#</th>
                <th class="c-drug">Medicamento</th>
                <th class="c-dose">Dosis</th>
                <th class="c-freq">Frecuencia</th>
                <th class="c-dur">Duración</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($prescription->items as $index => $item)
                <tr>
                    <td class="c-num">{{ $index + 1 }}</td>
                    <td class="c-drug">{{ $item['medication'] ?? '—' }}</td>
                    <td class="c-dose">{{ $item['dosage'] ?? '—' }}</td>
                    <td class="c-freq">{{ $item['frequency'] ?? '—' }}</td>
                    <td class="c-dur">{{ $item['duration'] ?? '—' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" style="color: var(--muted);">Sin medicamentos registrados.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    @if ($prescription->general_instructions)
        <table class="callout">
            <tr>
                <td>
                    <span class="callout-label">Indicaciones generales.</span>
                    {{ $prescription->general_instructions }}
                </td>
            </tr>
        </table>
    @endif

    <div class="footer">
        <table style="width: 100%;">
            <tr class="sign-row">
                <td style="width: 30%;"></td>
                <td style="width: 40%;">
                    <div class="sign-line"></div>
                    <div class="sign-name">{{ $prescription->doctor->name }}</div>
                    <div class="sign-meta">{{ $prescription->doctor->email }}</div>
                </td>
                <td style="width: 30%;"></td>
            </tr>
        </table>
        <div class="legal">
            Documento generado por Ngu hñe · Sistema de Gestión Clínica Intercultural · {{ $folio }}
        </div>
    </div>
</body>

</html>
