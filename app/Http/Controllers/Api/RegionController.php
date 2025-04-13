<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Region;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
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

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'idPais'      => 'nullable|integer|exists:Pais,idPais',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // 2. Inicializamos el query builder
        $query = Region::query();

        // 3. Aplicamos filtros si vienen en la petición
        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . trim($request->input('nombre')) . '%');
        }

        if ($request->filled('descripcion')) {
            $query->where('descripcion', 'like', '%' . trim($request->input('descripcion')) . '%');
        }

        if ($request->filled('idPais')) {
            $query->where('idPais', $request->input('idPais'));
        }

        // 4. Eager loading de relaciones: pais y Ciudades
        $query->with(['pais', 'Ciudades']);

        // 5. Ejecutamos la consulta con paginación
        try {
            $regiones = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $regiones
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de regiones: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
