<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Clase;
use Illuminate\Http\Request;

class ClaseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clases = Clase::with(['materia', 'grupo', 'usuario', 'aula'])->get();
        return response()->json($clases);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validamos los datos
        $validateData = $request->validate([
            'idMateria' => 'required|integer|exists:Materia,idMateria',
            'idGrupo'   => 'required|integer|exists:Grupo,idGrupo',
            'idUsuario' => 'required|integer|exists:Usuario,idUsuario',
            'idAula'    => 'required|integer|exists:Aula,idAula',
        ]);

        // Creamos el registro de la clase
        $clase = Clase::create($validateData);

        return response()->json([
            'message' => 'Clase creada correctamente',
            'clase'   => $clase
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $clase = Clase::with(['materia', 'grupo', 'usuario', 'aula'])->findOrFail($id);
        return response()->json($clase);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $clase = Clase::findOrFail($id);

        $validateData = $request->validate([
            'idMateria' => 'sometimes|required|integer|exists:Materia,idMateria',
            'idGrupo'   => 'sometimes|required|integer|exists:Grupo,idGrupo',
            'idUsuario' => 'sometimes|required|integer|exists:Usuario,idUsuario',
            'idAula'    => 'sometimes|required|integer|exists:Aula,idAula',
        ]);

        $clase->update($validateData);

        return response()->json($clase, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $clase = Clase::findOrFail($id);
        $clase->delete();

        return response()->json(['Message' => 'Clase successfully eliminated', 'status' => 200]);
    }
}
