<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FranjaHoraria;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class FranjaHorariaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $franjaHoraria = FranjaHoraria::with("horarios")->get();
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
                'codigo' => "required|string|max:15",
                'nombre' => "required|string|max:45",
                'horaInicio' => "required",
                'horaFin' => "required",
                'duracionMinutos' => "required|numeric",
                'tipo' => 'required|in:Fin de semana,Regular,Break,Tarde,Tarde Noche',
                'estado' => "required|in:Activo,Inactivo"
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
            'codigo' => "sometimes|required|string|max:15",
            'nombre' => "sometimes|required|string|max:45",
            'horaInicio' => "sometimes|required",
            'horaFin' => "sometimes|required",
            'duracionMinutos' => "sometimes|required|numeric",
            'tipo' => 'sometimes|required|in:Fin de semana,Regular,Break,Tarde,Tarde Noche',
            'estado' => "sometimes|required|in:Activo,Inactivo"
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

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'codigo'         => 'nullable|string|max:100',
            'nombre'         => 'nullable|string|max:255',
            'horaInicio'     => 'nullable|string|max:8',  // Formato HH:mm:ss o similar
            'horaFin'        => 'nullable|string|max:8',
            'duracionMinutos' => 'nullable|integer',
            'tipo'           => 'nullable|string|max:50',
            'estado'         => 'nullable|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo FranjaHoraria
        $query = FranjaHoraria::query();

        // Filtrado por código (búsqueda parcial)
        if ($request->filled('codigo')) {
            $codigo = trim($request->input('codigo'));
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

        // Filtrado por nombre (búsqueda parcial)
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        // Filtrado por horaInicio (búsqueda parcial)
        if ($request->filled('horaInicio')) {
            $horaInicio = trim($request->input('horaInicio'));
            $query->where('horaInicio', 'like', '%' . $horaInicio . '%');
        }

        // Filtrado por horaFin (búsqueda parcial)
        if ($request->filled('horaFin')) {
            $horaFin = trim($request->input('horaFin'));
            $query->where('horaFin', 'like', '%' . $horaFin . '%');
        }

        // Filtrado por duracionMinutos (búsqueda exacta)
        if ($request->filled('duracionMinutos')) {
            $duracionMinutos = $request->input('duracionMinutos');
            $query->where('duracionMinutos', $duracionMinutos);
        }

        // Filtrado por tipo (búsqueda parcial)
        if ($request->filled('tipo')) {
            $tipo = trim($request->input('tipo'));
            $query->where('tipo', 'like', '%' . $tipo . '%');
        }

        // Filtrado por estado (búsqueda parcial)
        if ($request->filled('estado')) {
            $estado = trim($request->input('estado'));
            $query->where('estado', 'like', '%' . $estado . '%');
        }

        // Se incluye la relación definida 'horarios'
        $query->with('horarios');

        try {
            // Se recomienda paginar los resultados para no sobrecargar la respuesta
            $franjas = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $franjas
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de franjas horarias: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
