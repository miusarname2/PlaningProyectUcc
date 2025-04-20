<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Horario;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $horarios = Horario::with(["curso", "profesional", "aula", "FranjaHoraria", "aula.sede.ciudad"])->get();
        return response()->json($horarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'idCurso' => "required|numeric|exists:curso,idCurso",
                'idProfesional' => "required|numeric|exists:profesional,idProfesional",
                'idAula' => "required|numeric|exists:aula,idAula",
                'idFranjaHoraria' => "required|numeric|exists:franja_horaria,idFranjaHoraria",
                'dia' => "required|string"
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $ex->errors()
            ], 422);
        }

        $duplicate = Horario::query()
            ->where('idAula', $validatedData['idAula'])
            ->where('idFranjaHoraria', $validatedData['idFranjaHoraria'])
            ->where('dia', $validatedData['dia'])
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Hay un conflicto en la inserción de los datos.'
            ], 409);
        }

        $horario = Horario::create($validatedData);

        $horario->load(["curso", "profesional", "aula", "FranjaHoraria"]);

        return response()->json($horario, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $horario = Horario::with(["curso", "profesional", "aula", "FranjaHoraria"])->findOrFail($id);
        return response()->json($horario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $horario = Horario::findOrFail($id);
            $validatedData = $request->validate([
                'idCurso' => "sometimes|numeric|exists:curso,idCurso",
                'idProfesional' => "sometimes|numeric|exists:profesional,idProfesional",
                'idAula' => "sometimes|numeric|exists:aula,idAula",
                'idFranjaHoraria' => "sometimes|numeric|exists:franja_horaria,idFranjaHoraria",
                'dia' => "sometimes|string"
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $ex->errors()
            ], 422);
        }

        $duplicate = Horario::query()
            ->where('idAula', $validatedData['idAula'])
            ->where('idFranjaHoraria', $validatedData['idFranjaHoraria'])
            ->where('dia', $validatedData['dia'])
            ->where('idHorario', '!=', $horario->idHorario)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'success' => false,
                'message' => 'Hay un conflicto en la inserción de los datos.'
            ], 409);
        }

        $horario->update($validatedData);

        return response()->json($horario, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $horario = Horario::findOrFail($id);

        $horario->delete();

        return response()->json(["message" => "Horario Deleted"]);
    }

    public function search(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idCurso'         => 'nullable|integer',
            'idProfesional'   => 'nullable|integer',
            'idAula'          => 'nullable|integer',
            'idFranjaHoraria' => 'nullable|integer',
            'dia'             => 'nullable|string|max:50',
            'curso_nombre'    => 'nullable|string|max:255',
            'curso_codigo'    => 'nullable|string|max:255',
            'curso_creditos'  => 'nullable|integer',
            'curso_horas'     => 'nullable|integer',
            'profesional_codigo' => 'nullable|string|max:255',
            'profesional_nombreCompleto' => 'nullable|string|max:255',
            'profesional_titulo' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        $query = Horario::query();

        // Filtros directos
        if ($request->filled('idCurso')) {
            $query->where('idCurso', $request->input('idCurso'));
        }
        if ($request->filled('idProfesional')) {
            $query->where('idProfesional', $request->input('idProfesional'));
        }
        if ($request->filled('idAula')) {
            $query->where('idAula', $request->input('idAula'));
        }
        if ($request->filled('idFranjaHoraria')) {
            $query->where('idFranjaHoraria', $request->input('idFranjaHoraria'));
        }
        if ($request->filled('dia')) {
            $dia = trim($request->input('dia'));
            $query->where('dia', 'like', '%' . $dia . '%');
        }

        // Filtros por relación: curso
        if ($request->filled('curso_nombre')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('nombre', 'like', '%' . $request->input('curso_nombre') . '%');
            });
        }
        if ($request->filled('curso_codigo')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('codigo', 'like', '%' . $request->input('curso_codigo') . '%');
            });
        }
        if ($request->filled('curso_creditos')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('creditos', $request->input('curso_creditos'));
            });
        }
        if ($request->filled('curso_horas')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('horas', $request->input('curso_horas'));
            });
        }

        // Filtros por relación: profesional
        if ($request->filled('profesional_codigo')) {
            $query->whereHas('profesional', function ($q) use ($request) {
                $q->where('codigo', 'like', '%' . $request->input('profesional_codigo') . '%');
            });
        }
        if ($request->filled('profesional_nombreCompleto')) {
            $query->whereHas('profesional', function ($q) use ($request) {
                $q->where('nombreCompleto', 'like', '%' . $request->input('profesional_nombreCompleto') . '%');
            });
        }
        if ($request->filled('profesional_titulo')) {
            $query->whereHas('profesional', function ($q) use ($request) {
                $q->where('titulo', 'like', '%' . $request->input('profesional_titulo') . '%');
            });
        }

        // Relaciona todo lo necesario
        $query->with(['curso', 'profesional', 'aula', 'FranjaHoraria']);

        try {
            $horarios = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $horarios
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de horarios: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
