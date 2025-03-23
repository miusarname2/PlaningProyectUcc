<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Materia;
use Illuminate\Http\Request;

class MateriaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $materia = Materia::all();
        return response()->json($materia);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre'=>'required|string|max:100'
        ]);

        $materia = Materia::create($validateData);

        return response()->json($materia,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $materia = Materia::findOrFail($id);
        return response()->json($materia);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $materia = Materia::findOrFail($id);
        $validateData = $request->validate([
            'nombre'=> 'sometimes|required|string|max:100'
        ]);

        $materia->update($validateData);
        return response()->json($materia);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $materia = Materia::findOrFail( $id );
        $materia->delete();
        return response()->json(['Message'=>'Materia successfully eliminated','status'=>200]);
    }
}
