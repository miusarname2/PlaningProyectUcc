<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perfiles = Perfil::with("roles")->get();
        return response()->json($perfiles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre'=>"required|string|max:200",
                'descripcion'=> "nullable|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $perfil = Perfil::create($validatedData);

        $perfil->load("roles");

        return response()->json($perfil,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $perfil = Perfil::with("roles")->findOrFail($id);
        return response()->json($perfil);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $perfil = Perfil::findOrFail($id);
        $validatedData = $request->validate([
            'nombre'=> "sometimes|required|string|200",
            'descripcion'=> "sometimes|nullable|string|"
        ]);

        $perfil->update($validatedData);
        $perfil->load("roles");
        
        return response()->json($perfil);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pais = Perfil::findOrFail($id);

        $pais->delete();

        return response()->json(['message'=>"Perfil Deleted"]);
    }
}
