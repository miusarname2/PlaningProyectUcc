<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;

class UsuarioGrupoController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'idUsuario' => 'required|integer|exists:usuario,idUsuario',
            'idGrupo'   => 'required|integer|exists:Grupo,idGrupo',
        ]);

        $usuario = Usuario::findOrFail($validate['idUsuario']);
        
        if ($usuario->grupos()->where('Grupo.idGrupo', $validate['idGrupo'])->exists()) {
            return response()->json(['message' => 'El usuario ya pertenece a ese grupo'], 409);
        }

        $usuario->grupos()->attach($validate['idGrupo']);

        return response()->json(['message' => 'Grupo asignado al usuario correctamente'], 201);    }

    /**
     * Remove the specified resource from storage.
     */
    public function removeGroup(Request $request)
    {
        $validate = $request->validate([
            'idUsuario' => 'required|integer|exists:usuario,idUsuario',
            'idGrupo'   => 'required|integer|exists:Grupo,idGrupo',
        ]);

        $usuario = Usuario::findOrFail($validate['idUsuario']);

        // Quitar la asignación (elimina el registro en la tabla pivot)
        $usuario->grupos()->detach($validate['idGrupo']);

        return response()->json(['message' => 'Grupo eliminado del usuario correctamente'], 200);
    }
}
