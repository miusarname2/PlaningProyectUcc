<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dia;
use Illuminate\Http\Request;

class DiaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $dia = Dia::all();
        return response()->json($dia);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validateData = $request->validate([
            'nombre'=> 'required|string|max:20'
        ]);

        $dia = Dia::create($validateData);

        return response()->json($dia,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $dia = Dia::findOrFail($id);

        return response()->json($dia);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $dia = Dia::findOrFail($id);

        $validateData = $request->validate([
            'nombre'=> 'sometimes|required|string|max:20'
        ]);

        $dia->update($validateData);

        return response()->json($dia);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $dia = Dia::findOrFail($id);

        $dia->delete();

        return response()->json(['Message'=>'Day successfully eliminated','status'=>200]);
    }
}
