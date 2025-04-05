<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RegionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $regions = Region::with(['pais', 'Ciudades'])->get();
        return response()->json($regions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre'=> "required|string|max:255",
                'descripcion'=> "nullable|string",
                'idPais'=> "required|integer|exists:pais,idPais"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $region = Region::create($validatedData);
        $region->load(['pais','Ciudades']);

        return response()->json($region,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $region = Region::with(['pais', 'Ciudades'])->findOrFail($id);
        return response()->json($region);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $region = Region::findOrFail($id);
        $validatedData = $request->validate([
            'nombre'      => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'idPais'      => 'sometimes|required|integer|exists:Pais,idPais'
        ]);

        $region->update($validatedData);
        $region->load(['pais','Ciudades']);

        return response()->json($region);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $region = Region::findOrFail($id);
        $region->delete();

        return response()->json(['message'=> 'Region Deleted Successfull']);
    }
}
