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
        $horarios = Horario::with(["curso", "profesional", "aula", "FranjaHoraria"])->get();
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

        $horario = Horario::create($validatedData);

        $horario->load(["curso", "profesional", "aula", "FranjaHoraria"]);

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
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'idCurso'         => 'nullable|integer',
            'idProfesional'   => 'nullable|integer',
            'idAula'          => 'nullable|integer',
            'idFranjaHoraria' => 'nullable|integer',
            'dia'             => 'nullable|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Horario
        $query = Horario::query();

        // Filtro: idCurso (búsqueda exacta)
        if ($request->filled('idCurso')) {
            $query->where('idCurso', $request->input('idCurso'));
        }

        // Filtro: idProfesional (búsqueda exacta)
        if ($request->filled('idProfesional')) {
            $query->where('idProfesional', $request->input('idProfesional'));
        }

        // Filtro: idAula (búsqueda exacta)
        if ($request->filled('idAula')) {
            $query->where('idAula', $request->input('idAula'));
        }

        // Filtro: idFranjaHoraria (búsqueda exacta)
        if ($request->filled('idFranjaHoraria')) {
            $query->where('idFranjaHoraria', $request->input('idFranjaHoraria'));
        }

        // Filtro: dia (búsqueda parcial)
        if ($request->filled('dia')) {
            $dia = trim($request->input('dia'));
            $query->where('dia', 'like', '%' . $dia . '%');
        }

        // Cargamos las relaciones definidas: curso y profesional
        $query->with(['curso', 'profesional']);

        try {
            // Se recomienda paginar los resultados para no sobrecargar la respuesta
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
