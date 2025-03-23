<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aula;
use Illuminate\Http\Request;

class AulaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $aula = Aula::all();
        return response()->json($aula);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'required|string'
        ]);

        $aula = Aula::create($validateData);
        return response()->json($aula, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $aula = Aula::findOrFail($id);
        return response()->json($aula);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $aula = Aula::findOrFail($id);

        $validateData = $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|required|string'
        ]);

        $aula->update($validateData);

        return response()->json($aula, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $aula = Aula::findOrFail($id);

        $aula->delete();

        return response()->json(['Message' => 'Aula successfully eliminated', 'status' => 200], 200);
    }
}
