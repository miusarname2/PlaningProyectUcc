<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class EstadoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $estados = Estado::with('region')->get();
        return response()->json($estados);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => "required|string|max:200",
                'descripcion' => "nullable|string",
                'idRegion' => "required|exists:region,idRegion"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $estado = Estado::create($validatedData);

        return response()->json([
            'message' => 'Estado creado con éxito',
            'estado'  => $estado
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $estado = Estado::with('region')->findOrFail($id);
        return response()->json($estado);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $estado = Estado::findOrFail($id);

        try {
            $validator = $request->validate([
                'nombre' => "required|string|max:200",
                'descripcion' => "nullable|string",
                'idRegion' => "required|exists:region,idRegion"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $estado->update($validator);

        return response()->json($estado);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $estado = Estado::findOrFail($id);
        $estado->delete();

        return response()->json([
            'message' => 'Estado eliminado con éxito'
        ]);
    }
}
