<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $subject ?? '' }}</title>
</head>
<body>
    <h2>Hola {{ $usuario->nombre }}</h2>

    @if ($daysLeft === 0)
        <p>¡Hoy es el último día de tu curso <strong>{{ $curso->nombre }}</strong>!</p>
    @else
        <p>Faltan <strong>{{ $daysLeft }}</strong> días para que termine el curso <strong>{{ $curso->nombre }}</strong>.</p>
        <p>¿Deseas renovarlo o reemplazarlo?</p>
    @endif

    <p>Fecha de finalización: {{ \Carbon\Carbon::parse($curso->fecha_fin)->format('d/m/Y') }}</p>
</body>
</html>
