<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proceso;
use Exception;
use Illuminate\Http\Request;
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
}
