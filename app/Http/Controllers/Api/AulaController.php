<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aula;
use App\Models\Proceso;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aulas = Aula::with(['sede'])->get();
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

        $proceso = Proceso::create($validatedData);

        $proceso->load(['sede']);

        return response()->json($proceso,201);
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
}
