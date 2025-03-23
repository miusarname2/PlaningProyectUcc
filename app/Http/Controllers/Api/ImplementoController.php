<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Implemento;
use Illuminate\Http\Request;

class ImplementoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $implementos = Implemento::with('aula')->get();
        return response()->json($implementos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre' => 'required|string|max:100',
            'idAula' => 'required|integer|exists:Aula,idAula',
        ]);

        $implemento = Implemento::create($validateData);

        return response()->json([
            'message' => 'Implemento creado correctamente',
            'implemento' => $implemento,
        ], 201);
    }
    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $implemento = Implemento::with('aula')->findOrFail($id);
        return response()->json($implemento);
    }

    public function getByAulaId(string|int $aulaId) {
        $implementos = Implemento::where('idAula', $aulaId)
        ->with('aula')
        ->get();

        return response()->json($implementos);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $implemento = Implemento::findOrFail($id);

        $validateData = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'idAula' => 'sometimes|required|integer|exists:Aula,idAula',
        ]);

        $implemento->update($validateData);

        return response()->json($implemento, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $implemento = Implemento::findOrFail($id);
        $implemento->delete();

        return response()->json(['Message'=>'Implemento successfully eliminated','status'=>200]);
    }
}
