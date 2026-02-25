<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Receta Médica - {{ $prescription->patient->full_name }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            margin-bottom: 30px;
            padding-bottom: 10px;
        }

        .clinic-name {
            font-size: 24px;
            font-bold: bold;
            color: #1e40af;
            margin: 0;
        }

        .doctor-info {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
        }

        .patient-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .patient-line {
            display: table;
            width: 100%;
            font-size: 13px;
        }

        .patient-cell {
            display: table-cell;
        }

        .section-title {
            font-size: 16px;
            font-weight: bold;
            color: #2563eb;
            border-bottom: 1px solid #e2e8f0;
            margin-bottom: 15px;
            padding-bottom: 5px;
            text-transform: uppercase;
        }

        .medication-item {
            margin-bottom: 20px;
            padding: 10px;
            border-left: 4px solid #3b82f6;
            background: #ffffff;
        }

        .med-name {
            font-size: 15px;
            font-weight: bold;
            margin-bottom: 3px;
        }

        .med-dosage {
            font-size: 13px;
            color: #4b5563;
        }

        .instructions {
            margin-top: 30px;
            font-size: 13px;
            font-style: italic;
            color: #4b5563;
            background: #fdf2f2;
            padding: 15px;
            border-radius: 5px;
        }

        .footer {
            position: fixed;
            bottom: 30px;
            left: 0;
            right: 0;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
        }

        .signature-line {
            width: 200px;
            border-top: 1px solid #000;
            margin: 0 auto 5px;
        }

        .date {
            float: right;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1 class="clinic-name">NGU_HNE - Clínica Médica</h1>
        <div class="doctor-info">
            <strong>Dr. {{ $prescription->doctor->name }}</strong><br>
            Cédula Prof: [Pendiente] | Medicina General
        </div>
    </div>

    <div class="date">
        Fecha: {{ $prescription->created_at->format('d/m/Y') }}
    </div>

    <div class="patient-box">
        <div class="patient-line">
            <div class="patient-cell"><strong>PACIENTE:</strong> {{ $prescription->patient->full_name }}</div>
            <div class="patient-cell" style="text-align: right;"><strong>EDAD:</strong>
                {{ $prescription->patient->birth_date->age }} años</div>
        </div>
    </div>

    <div class="section-title">Rp / Receta</div>

    @foreach($prescription->items as $item)
        <div class="medication-item">
            <div class="med-name">{{ $item['medication'] }}</div>
            <div class="med-dosage">
                {{ $item['dosage'] }}
                @if(!empty($item['frequency'])) — {{ $item['frequency'] }} @endif
                @if(!empty($item['duration'])) — {{ $item['duration'] }} @endif
            </div>
        </div>
    @endforeach

    @if($prescription->general_instructions)
        <div class="section-title">Indicaciones Generales</div>
        <div class="instructions">
            {{ $prescription->general_instructions }}
        </div>
    @endif

    <div class="footer">
        <div class="signature-line"></div>
        <div style="font-size: 12px;">Dr. {{ $prescription->doctor->name }}</div>
        <div style="font-size: 10px; color: #999; margin-top: 10px;">
            Este documento es una receta médica oficial generada por Ngu_hne System.
        </div>
    </div>
</body>

</html>