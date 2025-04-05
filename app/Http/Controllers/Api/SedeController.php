<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SedeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sede = Sede::with('ciudad')->get();

        return response()->json($sede);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'    => 'required|string|max:255',
                'nombre'    => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'tipo'      => 'required|string',
                'acceso'    => 'required|string',
                'idCiudad'  => 'required|integer|exists:ciudades,idCiudad'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $sede = Sede::create($validatedData);
        $sede->load('ciudad');

        return response()->json($sede, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sede = Sede::with('ciudad')->findOrFail($id);
        return response()->json($sede);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sede = Sede::findOrFail($id);

        $validatedData = $request->validate([
            'codigo'    => 'sometimes|required|string|max:255',
            'nombre'    => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'tipo'      => 'sometimes|required|string',
            'acceso'    => 'sometimes|required|string',
            'idCiudad'  => 'sometimes|required|integer|exists:ciudades,idCiudad'
        ]);

        $sede->update($validatedData);
        $sede->load('ciudad');

        return response()->json($sede);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sede = Sede::findOrFail($id);
        $sede->delete();

        return response()->json(['message' => 'Sede Deleted Successfully']);
    }
}
