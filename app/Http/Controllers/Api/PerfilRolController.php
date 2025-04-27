<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PerfilRol;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PerfilRolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $items = PerfilRol::with(['perfil', 'rol'])->get();
        return response()->json($items);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'idPerfil' => "required|integer|exists:perfil,idPerfil",
            'idRol'    => "required|integer|exists:rol,idRol"
        ]);

        // Evitar duplicados
        $exists = PerfilRol::where('idPerfil', $data['idPerfil'])
            ->where('idRol', $data['idRol'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'El vínculo ya existe'
            ], Response::HTTP_CONFLICT);
        }

        $pivot = PerfilRol::create($data);

        return response()->json($pivot, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $idPerfil, string $idRol)
    {
        $pivot = PerfilRol::where('idPerfil', $idPerfil)
            ->where('idRol',    $idRol)
            ->firstOrFail();

        return response()->json($pivot, Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string  $idPerfil, $idRol)
    {
        // Validar nuevos valores (pueden ser los mismos)
        $data = $request->validate([
            'idPerfil' => "required|integer|exists:perfil,idPerfil",
            'idRol'    => "required|integer|exists:rol,idRol"
        ]);

        $pivot = PerfilRol::where('idPerfil', $idPerfil)
            ->where('idRol',    $idRol)
            ->firstOrFail();

        // Si sólo quieres cambiar la relación, puedes:
        if (isset($data['new_idPerfil']) || isset($data['new_idRol'])) {
            // 1) Eliminas la actual
            $pivot->delete();
            // 2) Creas la nueva con valores pasados o por defecto los antiguos
            PerfilRol::create([
                'idPerfil' => $data['new_idPerfil'] ?? $idPerfil,
                'idRol'    => $data['new_idRol']    ?? $idRol,
            ]);

            return response()->json([
                'message' => 'Vínculo actualizado recreándolo'
            ], Response::HTTP_OK);
        }

        // Si hay otras columnas en la pivote, haz:
        // $pivot->fill($data)->save();
        return response()->json([
            'message' => 'Nada que actualizar'
        ], Response::HTTP_BAD_REQUEST);
    }


    public function destroy(string $idPerfil, $idRol)
    {
        $deleted = PerfilRol::where('idPerfil', $idPerfil)
            ->where('idRol', $idRol)
            ->delete();
    
        if ($deleted === 0) {
            return response()->json([
                'message' => 'El vínculo no existe'
            ], Response::HTTP_NOT_FOUND);
        }
    
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }
}