<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rol = Rol::with(['usuario','perfiles'])->get();
        return response()->json($rol);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre'      => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'permisos'    => 'required|string'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $rol = Rol::create($validatedData);

        if ($request->has('usuarios')) {
            // Se espera un arreglo de IDs de usuarios
            $rol->usuarios()->sync($request->input('usuarios'));
        }
        if ($request->has('perfiles')) {
            // Se espera un arreglo de IDs de perfiles
            $rol->perfiles()->sync($request->input('perfiles'));
        }

        $rol->load(['usuarios','perfiles']);

        return response()->json($rol,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rol = Rol::with(['usuario','perfiles'])->findOrFail($id);
        return response()->json($rol);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rol = Rol::findOrFail($id);

        $validatedData = $request->validate([
            'nombre'      => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'permisos'    => 'sometimes|required|string'
        ]);

        $rol = $rol->update($validatedData);

        if ($request->has('usuarios')) {
            $rol->usuarios()->sync($request->input('usuarios'));
        }
        if ($request->has('perfiles')) {
            $rol->perfiles()->sync($request->input('perfiles'));
        }

        $rol->load(['usuario','perfiles']);

        return response()->json($rol);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $rol = Rol::findOrFail($id);

        $rol->delete();

        return response()->json(['message'=> "Rol Deleted"]);
    }
}
