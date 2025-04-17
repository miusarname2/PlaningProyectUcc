<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aula;
use App\Models\Proceso;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aulas = Aula::with(['sede','sede.ciudad'])->get();
        return response()->json($aulas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'=>"required|string|max:17",
                'nombre'=> "required|string|max:90",
                'descripcion' => "nullable|string",
                "idSede" => "required|numeric",
                "capacidad" => "required|numeric",
                "estado" => "required|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $aula = Aula::create($validatedData);

        $aula->load(['sede']);

        return response()->json($aula,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $aula = Aula::with(['sede'])->findOrFail($id);
        return response()->json($aula);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $aula = Aula::findOrFail($id);
        $validatedData = $request->validate([
            'codigo'=>"sometimes|string|max:17",
            'nombre'=> "sometimes|string|max:90",
            'descripcion' => "sometimes|nullable|string",
            "idSede" => "sometimes|numeric",
            "capacidad" => "sometimes|numeric",
            "estado" => "sometimes|string"
        ]);

        $aula->update($validatedData);

        $aula->load(["sede"]);

        return response()->json($aula);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $aula = Aula::findOrFail($id);

        $aula->delete();

        return response()->json(['message' => "Aula Deleted"]);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'codigo'      => 'nullable|string|max:255',
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'idSede'      => 'nullable|integer|exists:sede,idSede',
            'capacidad'   => 'nullable|integer|min:0',
            'estado'      => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors(),
            ], 422);
        }

        // 2. Inicializamos el query builder
        $query = Aula::query();

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

        if ($request->filled('idSede')) {
            $query->where('idSede', $request->input('idSede'));
        }

        if ($request->filled('capacidad')) {
            $query->where('capacidad', $request->input('capacidad'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', 'like', '%' . trim($request->input('estado')) . '%');
        }

        // 4. Eager‑loading de la relación sede
        $query->with('sede');

        // 5. Ejecución con paginación
        try {
            $aulas = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $aulas,
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de aulas: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.',
            ], 500);
        }
    }
}
