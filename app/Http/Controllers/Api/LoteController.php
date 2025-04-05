<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lote;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lotes = Lote::with("programa")->get();
        return response()->json($lotes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'        => 'required|string|max:255',
                'nombre'        => 'required|string|max:255',
                'idPrograma'    => 'required|integer|exists:programas,idPrograma',
                'fechaInicio'   => 'required|date',
                'FechaFin'      => 'required|date',
                'numEstudiantes'=> 'required|integer',
                'estado'        => 'required|string'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $lote = Lote::create($validatedData);
        // Cargamos la relación del programa
        $lote->load('programa');

        return response()->json($lote, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $lote = Lote::with("programa")->findOrFail($id);
        return response()->json($lote);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $lote = Lote::findOrFail($id);

        $validatedData = $request->validate([
            'codigo'        => 'sometimes|required|string|max:255',
            'nombre'        => 'sometimes|required|string|max:255',
            'idPrograma'    => 'sometimes|required|integer|exists:programas,idPrograma',
            'fechaInicio'   => 'sometimes|required|date',
            'FechaFin'      => 'sometimes|required|date',
            'numEstudiantes'=> 'sometimes|required|integer',
            'estado'        => 'sometimes|required|string'
        ]);

        $lote->update($validatedData);
        $lote->load('programa');

        return response()->json($lote,200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $lote = Lote::findOrFail($id);
        $lote->delete();
        return response()->json([
            'message'=> "Lote deleted Succesffull"
        ],200);
    }
}
