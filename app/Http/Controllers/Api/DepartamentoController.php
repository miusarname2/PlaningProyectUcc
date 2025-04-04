<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class DepartamentoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $departamentos = Departamento::all();
            return response()->json($departamentos);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Ocurrió un error al obtener los usuarios',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'nombre'=> 'required|string|max:90',
                'descripcion'=>"required|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }
        
        $departamento = Departamento::create($validateData);
        return response()->json($departamento);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $departamento = Departamento::findOrFail($id);

        return response()->json($departamento);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $departamento = Departamento::findOrFail($id);

        $validateData = $request->validate([
            'codigo'=> "required|string|max:15",
            'nombre' => "required|string|max:90",
            'descripcion'=>"required|string",
            'creditos'=> "required|numeric",
            'horas'=>"required|numeric",
            'estado'=>"required|in:Activo,Inactivo"
        ]);

        $departamento->update($validateData);

        return response()->json($departamento);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $departamento = Departamento::findOrFail($id);
        $departamento->delete();
        return response()->json(["Message" => 'Se elimino satisfactoriamente.', "Status" => 200], 200);
    }
}
