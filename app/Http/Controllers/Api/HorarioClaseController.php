<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use App\Models\HorarioClase;
use Illuminate\Http\Request;

class HorarioClaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $horarioClase = HorarioClase::with(['clase', 'dia', 'hora'])->get();
        return response()->json($horarioClase);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'idClase' => 'required|integer|exists:Clase,idClase',
            'idDia'   => 'required|integer', // Ajusta la validación según la existencia de la tabla o modelo Dia
            'idHora'  => 'required|integer', // Ajusta la validación según la existencia de la tabla o modelo Hora
        ]);

        $horario = HorarioClase::create($validateData);

        return response()->json($horario, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string | int $idClase, string|int $idDia, string|int $idHora)
    {
        $horario = HorarioClase::where('idClase', $idClase)
            ->where('idDia', $idDia)
            ->where('idHora', $idHora)
            ->firstOrFail();

        return response()->json($horario, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string|int $idClase, string|int $idDia, string|int $idHora)
    {
        // Busca el registro actual usando la llave compuesta
        $horario = HorarioClase::where('idClase', $idClase)
            ->where('idDia', $idDia)
            ->where('idHora', $idHora)
            ->firstOrFail();

        // Validamos que el nuevo día y la nueva hora existan en las tablas correspondientes
        // (Se asume que tienes las tablas 'Dias' y 'Horas' con sus respectivos modelos; de lo contrario, ajusta las validaciones)
        $validateData = $request->validate([
            'idDia'  => 'required|integer|exists:Dias,idDia',
            'idHora' => 'required|integer|exists:Horas,idHora',
        ]);

        // Si la combinación de idDia e idHora no cambia, podemos continuar sin problemas.
        if ($validateData['idDia'] != $idDia || $validateData['idHora'] != $idHora) {
            // Verificamos si ya existe otro registro con la misma idClase, nuevo idDia e idHora
            $exists = HorarioClase::where('idClase', $idClase)
                ->where('idDia', $validateData['idDia'])
                ->where('idHora', $validateData['idHora'])
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'La combinación de día y hora ya existe para esta clase.'
                ], 409);
            }
        }

        // Actualizamos el registro con los nuevos datos
        $horario->update($validateData);

        return response()->json($horario, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string|int $idClase, string|int $idDia, string|int $idHora)
    {
        $horario = HorarioClase::where('idClase', $idClase)
            ->where('idDia', $idDia)
            ->where('idHora', $idHora)
            ->firstOrFail();

        $horario->delete();

        return response()->json(['Message' => 'HorarioClase successfully eliminated', 'status' => 200]);
    }

    public function getScheduleByUser($idUsuario)
    {
        // Obtenemos todos los horarios (con relaciones) de las clases que pertenecen al usuario
        $horarios = HorarioClase::with(['dia', 'hora', 'clase.aula', 'clase'])
            ->whereHas('clase', function ($query) use ($idUsuario) {
                $query->where('idUsuario', $idUsuario);
            })
            ->get();

        if ($horarios->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron horarios para este usuario.'
            ], 404);
        }

        // Agrupamos por la clase (por idClase) para organizar los horarios
        $grouped = $horarios->groupBy('idClase');

        $result = [];

        foreach ($grouped as $idClase => $horariosGroup) {
            // Extraemos la información de la clase (asumimos que todas las entradas tienen la misma clase)
            $clase = $horariosGroup->first()->clase;
            // Obtenemos los días únicos para esta clase
            $dias = $horariosGroup->pluck('dia')->unique('idDia')->values();
            // Obtenemos las horas únicas para esta clase
            $horas = $horariosGroup->pluck('hora')->unique('idHora')->values();

            $result[] = [
                'clase' => $clase,
                'aula'  => $clase->aula,
                'dias'  => $dias,
                'horas' => $horas,
            ];
        }

        return response()->json($result, 200);
    }

    public function getFullScheduleByUser($idUsuario)
    {
        // Obtenemos todas las clases asignadas al usuario, con sus relaciones: materia, grupo y aula.
        $clases = Clase::with(['materia', 'grupo', 'aula'])
            ->where('idUsuario', $idUsuario)
            ->get();

        if ($clases->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron clases para este usuario.'
            ], 404);
        }

        $result = [];

        // Para cada clase, obtenemos los horarios (días y horas) en que se imparte.
        foreach ($clases as $clase) {
            // Se cargan los horarios de la clase, junto con la información de día y hora.
            $horarios = HorarioClase::with(['dia', 'hora'])
                ->where('idClase', $clase->idClase)
                ->get();

            // Extraemos días y horas únicos, en caso de que se repitan.
            $dias = $horarios->pluck('dia')->unique('idDia')->values();
            $horas = $horarios->pluck('hora')->unique('idHora')->values();

            $result[] = [
                'clase'    => $clase,
                'materia'  => $clase->materia,
                'grupo'    => $clase->grupo,
                'aula'     => $clase->aula,
                'dias'     => $dias,
                'horas'    => $horas,
                'horarios' => $horarios,
            ];
        }

        return response()->json($result, 200);
    }
}
