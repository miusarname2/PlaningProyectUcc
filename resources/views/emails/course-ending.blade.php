<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Resumen de Cursos por Vencer</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 640px;
            margin: auto;
            background-color: #ffffff;
            padding: 24px;
            border-radius: 8px;
        }
        .header {
            background-color: #3b82f6;
            color: white;
            padding: 16px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .curso {
            border: 1px solid #e5e7eb;
            padding: 16px;
            margin-top: 16px;
            border-radius: 8px;
        }
        .badge {
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: bold;
            color: white;
            display: inline-block;
        }
        .badge.red { background-color: #ef4444; }
        .badge.yellow { background-color: #f59e0b; }
        .badge.green { background-color: #10b981; }
        .footer {
            margin-top: 24px;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <h2>📘 PlanningProject</h2>
        <p>Sistema de Gestión Académica</p>
    </div>

    <h3>⚠️ Recordatorio: Cursos por Vencer</h3>

    <p>Estimado/a {{ $usuario->nombre }},</p>
    <p>A continuación se listan los cursos que están próximos a vencer. Te recomendamos revisarlos y completar todas las actividades pendientes:</p>

    @foreach ($cursos as $curso)
        @php
            $fechaFin = \Carbon\Carbon::parse($curso->fecha_fin);
            $daysLeft = now()->diffInDays($fechaFin, false);
            $daysLeft = intval($daysLeft);

            $badgeColor = $daysLeft === 0 ? 'red' : ($daysLeft <= 3 ? 'yellow' : 'green');
            $badgeText = $daysLeft === 0 ? 'Vence Hoy' : ($daysLeft === 1 ? 'Vence Mañana' : "Vence en {$daysLeft} días");
        @endphp

        <div class="curso">
            <h4>{{ $curso->codigo }} – {{ $curso->nombre }}</h4>
            <p><strong>Programa:</strong> {{ $curso->programa ?? 'Ingeniería de Sistemas' }}</p>
            <p>
                <strong>Fecha límite:</strong>
                {{ $fechaFin->format('d M Y') }} a las {{ $fechaFin->format('h:i A') }}
            </p>
            <span class="badge {{ $badgeColor }}">{{ $badgeText }}</span>
            <p><strong>Actividades pendientes:</strong> {{ $curso->pendientes ?? 'No especificadas' }}</p>
        </div>
    @endforeach

    <div class="footer">
        Este correo fue generado automáticamente por PlanningProject.
    </div>
</div>
</body>
</html>
