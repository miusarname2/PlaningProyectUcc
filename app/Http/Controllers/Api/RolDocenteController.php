<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RolDocente;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RolDocenteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rolesDocentes = RolDocente::all();
        return response()->json([
            'success' => true,
            'data'    => $rolesDocentes
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'codigo'      => 'required|string|max:20|unique:rolDocente,codigo',
                'nombre'      => 'required|string|max:50',
                'descripcion' => 'nullable|string',
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'errors'  => $ex->errors(),
            ], 422);
        }

        $rolesDocentes = RolDocente::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $rolesDocentes,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rolesDocentes = RolDocente::findOrFail($id);
        return response()->json([
            'success' => true,
            'data'    => $rolesDocentes,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rolesDocentes = RolDocente::findOrFail($id);

        try {
            $validated = $request->validate([
                'codigo'      => 'sometimes|string|max:20|unique:rolDocente,codigo,' . $rolesDocentes->idRolDocente . ',idRolDocente',
                'nombre'      => 'sometimes|string|max:50',
                'descripcion' => 'nullable|string',
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'errors'  => $ex->errors(),
            ], 422);
        }

        $rolesDocentes->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $rolesDocentes,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $rolesDocentes = RolDocente::findOrFail($id);

        if ($rolesDocentes->profesionales()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: hay profesionales asociados a este rol.',
            ], 409);
        }

        $rolesDocentes->delete();

        return response()->json([
            'success' => true,
            'message' => 'RolDocente eliminado correctamente.',
        ], 200);
    }
}
