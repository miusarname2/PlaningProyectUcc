<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Curso;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CursoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cursos = Curso::with(['programas','especialidades'])->get();
        return response()->json($cursos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'codigo' => "required|string|max:12",
                'nombre' => "required|string|max:100",
                'descripcion' => "required|string",
                'creditos' => 'required|numeric',
                'horas' => "required|numeric",
                'estado' => 'required|in:Activo,Inactivo'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $curso = Curso::create($validateData);
        return response()->json($curso);
    }

    /**
     * Display the specified resource.
     */     public function show(string $id)
    {
        $curso = Curso::findOrFail($id);
        return response()->json($curso);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $curso = Curso::findOrFail($id);

        $validateData = $request->validate([
            'codigo' => "sometimes|required|string|12",
            'nombre' => "sometimes|required|string|max:100",
            'descripcion' => 'sometimes|required|string',
            'creditos' => "sometimes|required|numeric",
            'horas' => "sometimes|required|numeric",
            'estado' => 'sometimes|required|in:Activo,Inactivo'
        ]);

        $curso->update($validateData);
        return response()->json($curso);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $curso = Curso::findOrFail($id);
        $curso->delete();
        return response()->json(['message' => 'Curso eliminado correctamente!']);
    }
}
