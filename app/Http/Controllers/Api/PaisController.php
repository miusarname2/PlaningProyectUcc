<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pais;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PaisController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lotes = Pais::with("regiones")->get();
        return response()->json($lotes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'nombre'=> "required|string|max:200",
                'descripcion' => "nullable|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $pais = Pais::create($validateData);
        $pais->load("regiones");

        return response()->json($pais,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $pais = Pais::with("regiones")->findOrFail($id);
        return response()->json($pais);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $pais = Pais::findOrFail($id);
        $validateData = $request->validate([
            'nombre'=> "sometimes|required|string|max:255",
            'descripcion'=> "sometimes|nullable|string"
        ]);

        $pais->update($validateData);
        $pais->load("regiones");

        return response()->json($pais,200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pais = Pais::findOrFail($id);

        $pais->delete();

        return response()->json(['message'=>"Pais Deleted success"],200);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // 2. Iniciamos el query builder
        $query = Pais::query();

        // 3. Aplicamos filtros si vienen en la petición
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        if ($request->filled('descripcion')) {
            $descripcion = trim($request->input('descripcion'));
            $query->where('descripcion', 'like', '%' . $descripcion . '%');
        }

        // 4. Cargamos la relación regiones
        $query->with('regiones');

        // 5. Ejecutamos la consulta con paginación
        try {
            $paises = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $paises
            ]);
        } catch (\Exception $ex) {
            Log::error('Error en búsqueda de países: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
