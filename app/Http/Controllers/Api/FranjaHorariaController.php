<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FranjaHoraria;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FranjaHorariaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $franjaHoraria = FranjaHoraria::all();
            return response()->json($franjaHoraria);
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
                'codigo'=>"required|string|max:15",
                'nombre'=> "required|string|max:45",
                'horaInicio'=> "required|date",
                'horaFin'=> "required|date",
                'duracionMinutos'=> "required|numeric",
                'tipo' => 'required|in:Fin de semana,Regular,Break,Tarde,Tarde Noche',
                'estado'=> "required|in:Activo,Inactivo"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $franjaHoraria = FranjaHoraria::create($validateData);
        return response()->json($franjaHoraria);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $franjaHoraria = FranjaHoraria::findOrFail($id);
        return response()->json($franjaHoraria);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $franjaHoraria = FranjaHoraria::findOrFail($id);

        $validateData = $request->validate([
            'codigo'=>"sometimes|required|string|max:15",
            'nombre'=> "sometimes|required|string|max:45",
            'horaInicio'=> "sometimes|required|date",
            'horaFin'=> "sometimes|required|date",
            'duracionMinutos'=> "sometimes|required|numeric",
            'tipo' => 'sometimes|required|in:Fin de semana,Regular,Break,Tarde,Tarde Noche',
            'estado'=> "sometimes|required|in:Activo,Inactivo"
        ]);

        $franjaHoraria->update($validateData);
        return response()->json($franjaHoraria);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $franjaHoraria = FranjaHoraria::findOrFail($id);
        $franjaHoraria->delete();
        return response()->jsonjson(["Message" => 'Se elimino satisfactoriamente.', "Status" => 200], 200);
    }
}
