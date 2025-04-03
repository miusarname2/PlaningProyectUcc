<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use Illuminate\Http\Request;

class CiudadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ciudades = Ciudad::all();
        return response()->json($ciudades);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre'       => 'required|string|max:100',
            'codigo_postal' => 'nullable|string|max:10',
            'id_region'    => 'required|exists:regiones,id_region'
        ]);

        $ciudad = Ciudad::create($validateData);
        return response()->json($ciudad, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ciudad = Ciudad::findOrFail($id);

        return response()->json($ciudad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $ciudad = Ciudad::findOrFail($id);

        $validatedData = $request->validate([
            'nombre'       => 'sometimes|required|string|max:100',
            'codigoPostal' => 'nullable|string|max:10',
            'idRegion'    => 'sometimes|required|exists:regiones,idRegion'
        ]);

        $ciudad->update($validatedData);
        return response()->json($ciudad);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ciudad = Ciudad::findOrFail($id);
        $ciudad->delete();
        return response()->json(["Message" => 'Se elimino satisfactoriamente.', "Status" => 200], 200);
    }
}
