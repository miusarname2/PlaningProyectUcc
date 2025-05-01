<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CiudadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ciudades = Ciudad::with(['sedes', 'Region', "Region.pais","Region.estados"])->get();
        return response()->json($ciudades);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'nombre'       => 'required|string|max:100',
                'codigoPostal' => 'nullable|string|max:10',
                'idRegion'    => 'required|numeric|exists:region,idRegion',
                'idEstado' => 'required|numeric|exists:estado,idEstado'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $ciudad = Ciudad::create($validateData);
        return response()->json($ciudad, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ciudad = Ciudad::findOrFail($id);

        return response()->json($ciudad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $ciudad = Ciudad::findOrFail($id);

        $validatedData = $request->validate([
            'nombre'       => 'sometimes|required|string|max:100',
            'codigoPostal' => 'nullable|string|max:10',
            'idRegion'    => 'sometimes|required|exists:region,idRegion'
        ]);

        $ciudad->update($validatedData);
        return response()->json($ciudad);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ciudad = Ciudad::findOrFail($id);
        $ciudad->delete();
        return response()->json(["Message" => 'Se elimino satisfactoriamente.', "Status" => 200], 200);
    }

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'nombre'       => 'nullable|string|max:255',
            'codigoPostal' => 'nullable|string|max:20',
            'idRegion'     => 'nullable|integer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Ciudad
        $query = Ciudad::query();

        // Aplicamos cada filtro si se encuentra presente en la petición

        // Búsqueda por nombre (parcial)
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        // Búsqueda por código postal (parcial)
        if ($request->filled('codigoPostal')) {
            $codigoPostal = trim($request->input('codigoPostal'));
            $query->where('codigoPostal', 'like', '%' . $codigoPostal . '%');
        }

        // Búsqueda por idRegion (búsqueda exacta)
        if ($request->filled('idRegion')) {
            $idRegion = $request->input('idRegion');
            $query->where('idRegion', $idRegion);
        }

        // Se incluyen las relaciones definidas en el modelo, por ejemplo Region y sedes
        $query->with(['Region', 'sedes']);

        try {
            // Paginar los resultados
            $ciudades = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $ciudades
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de ciudades: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
