<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grupo;
use Illuminate\Http\Request;

class GrupoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $grupos = Grupo::all();
        return response()->json($grupos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre' => 'required|string|max:50',
            'descripcion' => 'required|string'
        ]);

        $grupo = Grupo::create($validateData);
        return response()->json($grupo, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $grupo = Grupo::findOrFail($id);
        return response()->json($grupo);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $grupo = Grupo::findOrFail($id);
        $validateData = $request->validate([
            'nombre' => 'sometimes|required|string|max:50',
            'descripcion' => 'sometimes|required|string'
        ]);
        $grupo->update($validateData);
        return response()->json($grupo);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $grupo = Grupo::findOrFail($id);
        $grupo->delete();
        return response()->json(['Message'=>'Group successfully eliminated','status'=>200]);
    }
}
