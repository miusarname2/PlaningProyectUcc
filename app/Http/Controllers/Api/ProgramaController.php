<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Programa;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProgramaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programa = Programa::with(["especialidad", "lotes", "cursos"])->get();
        return response()->json($programa);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'        => 'required|string|max:255',
                'nombre'        => 'required|string|max:255',
                'descripcion'   => 'nullable|string',
                'duracion'      => 'required|string|max:255',
                'idEspecialidad' => 'required|integer|exists:especialidades,idEspecialidad',
                'estado'        => 'required|string'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $programa = Programa::create($validatedData);
        $programa->load('especialidad');
        return response()->json($programa, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $programa = Programa::with("especialidad")->findOrFail($id);
        return response()->json($programa);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $programa = Programa::findOrFail($id);

        $validatedData = $request->validate([
            'codigo'        => 'sometimes|required|string|max:255',
            'nombre'        => 'sometimes|required|string|max:255',
            'descripcion'   => 'sometimes|nullable|string',
            'duracion'      => 'sometimes|required|string|max:255',
            'idEspecialidad' => 'sometimes|required|integer|exists:especialidad,idEspecialidad',
            'estado'        => 'sometimes|required|string'
        ]);

        $programa->update($validatedData);
        $programa->load('especialidad');

        return response()->json($programa);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $programa = Programa::findOrFail($id);
        $programa->delete();
        return response()->json(["message" => "Programa deleted successfull"]);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'codigo'           => 'nullable|string|max:255',
            'nombre'           => 'nullable|string|max:255',
            'descripcion'      => 'nullable|string|max:1000',
            'duracion'         => 'nullable|integer|min:0',
            'idEspecialidad'   => 'nullable|integer|exists:especialidad,idEspecialidad',
            'estado'           => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // 2. Inicializamos el query builder
        $query = Programa::query();

        // 3. Aplicamos filtros si vienen en la petición
        if ($request->filled('codigo')) {
            $query->where('codigo', 'like', '%' . trim($request->input('codigo')) . '%');
        }

        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . trim($request->input('nombre')) . '%');
        }

        if ($request->filled('descripcion')) {
            $query->where('descripcion', 'like', '%' . trim($request->input('descripcion')) . '%');
        }

        if ($request->filled('duracion')) {
            $query->where('duracion', $request->input('duracion'));
        }

        if ($request->filled('idEspecialidad')) {
            $query->where('idEspecialidad', $request->input('idEspecialidad'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', 'like', '%' . trim($request->input('estado')) . '%');
        }

        // 4. Cargamos relaciones: especialidad, lotes y cursos
        $query->with(['especialidad', 'lotes', 'cursos']);

        // 5. Ejecutamos la consulta con paginación
        try {
            $programas = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $programas
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de programas: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
