<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VariablesEntorno;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class VariablesEntornoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $variableEntorno = VariablesEntorno::all();
        return response()->json($variableEntorno);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                "nombre" => "required|string",
                'valor' => "required|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $variableEntorno = VariablesEntorno::create($validatedData);

        return response()->json($variableEntorno);
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

        $validatedData = $request->validate([
            'nombre' => "sometimes|required|string",
            'valor' => "sometimes|required|string"
        ]);

        $variableEntorno->update($validatedData);

        return response()->json($variableEntorno);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $variableEntorno = VariablesEntorno::findOrFail($id);
        $variableEntorno->delete();

        return response()->json(["message" => "VariableEntorno Deleted"]);
    }
}
