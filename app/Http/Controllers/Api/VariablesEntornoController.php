<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VariablesEntorno;
use Illuminate\Http\Request;

class VariablesEntornoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $variablesEntornno = VariablesEntorno::all();
        return response()->json($variablesEntornno);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            "nombre" => 'required|string',
            'valor' => 'required|string'
        ]);

        $variableEntorno = VariablesEntorno::create($validate);

        return response()->json($variableEntorno,201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $variableEntorno = VariablesEntorno::findOrFail($id);

        return response()->json($variableEntorno);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $variableEntorno = VariablesEntorno::findOrFail($id);

        $validate = $request->validate([
            'nombre'=> 'sometimes|required|string',
            'valor'=> 'sometimes|required|string'
        ]);

        $variableEntorno = VariablesEntorno::update($validate);

        return response()->json($variableEntorno);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $variableEntorno = VariablesEntorno::findOrFail($id);

        $variableEntorno->delete();

        return response()->json(['Message'=>'Env successfully eliminated','status'=>200],200);
    }
}
