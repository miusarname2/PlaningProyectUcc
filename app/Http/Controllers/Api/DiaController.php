<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dia;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DiaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dias = Dia::all();
        return response()->json([
            'success' => true,
            'data'    => $dias,
        ], 200);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:20|unique:dia,nombre',
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'errors'  => $ex->errors(),
            ], 422);
        }

        $dia = Dia::create($validated);

        return response()->json([
            'success' => true,
            'data'    => $dia,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dia = Dia::find($id);
        if (! $dia) {
            return response()->json([
                'success' => false,
                'message' => 'Día no encontrado.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => $dia,
        ], 200);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $dia = Dia::find($id);
        if (! $dia) {
            return response()->json([
                'success' => false,
                'message' => 'Día no encontrado.',
            ], 404);
        }

        try {
            $validated = $request->validate([
                'nombre' => 'required|string|max:20|unique:dia,nombre,' . $dia->idDia . ',idDia',
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'errors'  => $ex->errors(),
            ], 422);
        }

        $dia->update($validated);

        return response()->json([
            'success' => true,
            'data'    => $dia,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dia = Dia::find($id);
        if (! $dia) {
            return response()->json([
                'success' => false,
                'message' => 'Día no encontrado.',
            ], 404);
        }

        // Evitar eliminar si hay horarios asociados
        if ($dia->horarios()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'No se puede eliminar: existen horarios asignados a este día.',
            ], 409);
        }

        $dia->delete();

        return response()->json([
            'success' => true,
            'message' => 'Día eliminado correctamente.',
        ], 200);
    }
}
