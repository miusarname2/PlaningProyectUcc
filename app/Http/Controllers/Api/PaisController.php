<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pais;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PaisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lotes = Pais::with("regiones")->get();
        return response()->json($lotes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'nombre'=> "required|string|max:200",
                'descripcion' => "nullable|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $pais = Pais::create($validateData);
        $pais->load("regiones");

        return response()->json($pais,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $pais = Pais::with("regiones")->findOrFail($id);
        return response()->json($pais);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pais = Pais::findOrFail($id);
        $validateData = $request->validate([
            'nombre'=> "sometimes|required|string|max:255",
            'descripcion'=> "sometimes|nullable|string"
        ]);

        $pais->update($validateData);
        $pais->load("regiones");

        return response()->json($pais,200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pais = Pais::findOrFail($id);

        $pais->delete();

        return response()->json(['message'=>"Pais Deleted success"],200);
    }
}
