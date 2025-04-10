<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UsuarioPerfil;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UsuarioPerfilController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarioPerfil = UsuarioPerfil::with(['usuario', 'perfil'])->get();
        return response()->json($usuarioPerfil);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'idUsuario' => 'required|integer|exists:usuario,idUsuario',
                'idPerfil'  => 'required|integer|exists:perfil,idPerfil'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $usuarioPerfil = UsuarioPerfil::create($validatedData);
        $usuarioPerfil->load(['usuario', 'perfil']);

        return response()->json($usuarioPerfil, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $usuarioPerfil = UsuarioPerfil::with(['usuario', 'perfil'])->findOrFail($id);
        return response()->json($usuarioPerfil, 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuarioPerfil = UsuarioPerfil::findOrFail($id);

        $validatedData = $request->validate([
            'idUsuario' => 'sometimes|required|integer|exists:usuarios,idUsuario',
            'idPerfil'  => 'sometimes|required|integer|exists:perfiles,idPerfil'
        ]);

        $usuarioPerfil->update($validatedData);
        $usuarioPerfil->load(['usuario', 'perfil']);

        return response()->json($usuarioPerfil);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $usuarioPerfil = UsuarioPerfil::findOrFail($id);
        $usuarioPerfil->delete();

        return response()->json(['message' => "UsuarioPefil deleted successfully"], 200);
    }
}
