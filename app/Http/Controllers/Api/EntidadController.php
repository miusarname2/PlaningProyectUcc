<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidad;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class EntidadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $entidades = Entidad::all();
        return response()->json($entidades);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'codigo' => "required|string|max:16",
                'nombre' => "required|string|max:90",
                'descripcion' => "required|string",
                'estado' => "required|string|in:Activo,Inactivo",
                'contacto' => "required|string|max:100"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $entidad = Entidad::create($validateData);
        return response()->json($entidad, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $entidad = Entidad::findOrFail($id);
        return response()->json($entidad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $entidad = Entidad::findOrFail($id);

        $validateData = $request->validate([
            'codigo' => "sometimes|required|string|16",
            'nombre' => "sometimes|required|max:90",
            'descripcion' => "required|string",
            'estado' => "required|string|in:Activo,Inactivo",
            'contacto' => "required|string|max:100"
        ]);

        $entidad->update($validateData);
        return response()->json($entidad);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $entidad = Entidad::findOrFail($id);
        $entidad->delete();
        return response()->jsonjson(["Message" => 'Se elimino satisfactoriamente.', "Status" => 200], 200);
    }
}
