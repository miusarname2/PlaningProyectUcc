<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\VariablesEntorno;
use Illuminate\Http\Request;

class ReporteEventoController extends Controller
{
    public function getReporteDocentesEventos()
    {
        // Se busca en la base de datos el registro de la variable de entorno con nombre "nombreRolDocente"
        $variable = VariablesEntorno::where('nombre', 'nombreRolDocente')->first();

        if (!$variable) {
            return response()->json([
                'message' => 'La variable "nombreRolDocente" no está configurada en la base de datos.'
            ], 400);
        }

        // Se obtiene el valor de la variable
        $nombreRolDocente = $variable->valor;

        // Consulta los usuarios (docentes) cuyo rol tenga el nombre igual al valor obtenido,
        // junto con sus clases y la información relacionada (materia, grupo, aula, días y horas de clase).
        $docentes = Usuario::with([
            'clases.materia',      // Información de la materia
            'clases.grupo',        // Información del grupo
            'clases.aula',         // Información del aula
            'clases.horarios.dia', // Días en que se dicta la clase
            'clases.horarios.hora' // Horas en que se dicta la clase
        ])
            ->whereHas('rol', function ($query) use ($nombreRolDocente) {
                $query->where('nombre', $nombreRolDocente);
            })
            ->get();

        return response()->json($docentes, 200);
    }
}
