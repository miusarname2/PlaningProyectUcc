<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Programa;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ProgramaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $programa = Programa::with("especialidad")->get();
        return response()->json($programa);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'        => 'required|string|max:255',
                'nombre'        => 'required|string|max:255',
                'descripcion'   => 'nullable|string',
                'duracion'      => 'required|string|max:255',
                'idEspecialidad' => 'required|integer|exists:especialidades,idEspecialidad',
                'estado'        => 'required|string'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $programa = Programa::create($validatedData);
        $programa->load('especialidad');
        return response()->json($programa, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $programa = Programa::with("especialidad")->findOrFail($id);
        return response()->json($programa);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $programa = Programa::findOrFail($id);

        $validatedData = $request->validate([
            'codigo'        => 'sometimes|required|string|max:255',
            'nombre'        => 'sometimes|required|string|max:255',
            'descripcion'   => 'sometimes|nullable|string',
            'duracion'      => 'sometimes|required|string|max:255',
            'idEspecialidad'=> 'sometimes|required|integer|exists:especialidad,idEspecialidad',
            'estado'        => 'sometimes|required|string'
        ]);

        $programa->update($validatedData);
        $programa->load('especialidad');

        return response()->json($programa);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $programa = Programa::findOrFail($id);
        $programa->delete();
        return response()->json(["message" => "Programa deleted successfull"]);
    }
}
