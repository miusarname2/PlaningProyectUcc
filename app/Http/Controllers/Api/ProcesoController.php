<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proceso;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProcesoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $procesos = Proceso::with("departamento")->get();
        return response()->json($procesos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                "codigo" => "required|string|max:17",
                "nombre" => "required|string|max:90",
                "descripcion" => "nullable|string",
                "cantidadPasos" => "required|numeric",
                "idDepartamento" => "required|numeric",
                "estado" => "required|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $proceso = Proceso::create($validatedData);

        $proceso->load('departamento');

        return response()->json($proceso, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $proceso = Proceso::with('departamento')->findOrFail($id);
        return response()->json($proceso);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $proceso = Proceso::findOrFail($id);
        $validatedData = $request->validate([
            'codigo' => "sometimes|string|max:17",
            'nombre' => "sometimes|string|max:90",
            'descripcion' => "sometimes|string",
            'cantidadPasos' => "sometimes|numeric",
            'idDepartamento' => "sometimes|numeric",
            "estado" => "sometimes|string",
        ]);

        $proceso->update($validatedData);

        $proceso->load("departamento");

        return response()->json($proceso);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $proceso = Proceso::findOrFail($id);

        $proceso->delete();

        return response()->json(['message' => "Process Deleted"]);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'codigo'          => 'nullable|string|max:255',
            'nombre'          => 'nullable|string|max:255',
            'descripcion'     => 'nullable|string|max:1000',
            'cantidadPasos'   => 'nullable|integer|min:0',
            'idDepartamento'  => 'nullable|integer|exists:departamento,idDepartamento',
            'estado'          => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors(),
            ], 422);
        }

        // 2. Iniciamos el query builder
        $query = Proceso::query();

        // 3. Aplicamos filtros condicionales
        if ($request->filled('codigo')) {
            $query->where('codigo', 'like', '%' . trim($request->input('codigo')) . '%');
        }

        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . trim($request->input('nombre')) . '%');
        }

        if ($request->filled('descripcion')) {
            $query->where('descripcion', 'like', '%' . trim($request->input('descripcion')) . '%');
        }

        if ($request->filled('cantidadPasos')) {
            $query->where('cantidadPasos', $request->input('cantidadPasos'));
        }

        if ($request->filled('idDepartamento')) {
            $query->where('idDepartamento', $request->input('idDepartamento'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', 'like', '%' . trim($request->input('estado')) . '%');
        }

        // 4. Eager‑loading de la relación departamento
        $query->with('departamento');

        // 5. Ejecutamos la consulta con paginación
        try {
            $procesos = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $procesos,
            ]);
        } catch (\Exception $ex) {
            Log::error('Error en búsqueda de procesos: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.',
            ], 500);
        }
    }
}
