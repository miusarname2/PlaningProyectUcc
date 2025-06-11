<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lote;
use Exception;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class LoteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lotes = Lote::with(["ciudad"])->get();
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
                'idCiudad'    => 'required|integer|exists:ciudad,idCiudad',
                'fechaInicio'   => 'required|date',
                'FechaFin'      => 'required|date',
                'numEstudiantes' => 'required|integer',
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
        $lote->load('ciudad');

        return response()->json($lote, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $lote = Lote::with("ciudad")->findOrFail($id);
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
            'idCiudad'    => 'sometimes|required|integer|exists:ciudad,idCiudad',
            'fechaInicio'   => 'sometimes|required|date',
            'FechaFin'      => 'sometimes|required|date',
            'numEstudiantes' => 'sometimes|required|integer',
            'estado'        => 'sometimes|required|string'
        ]);

        $lote->update($validatedData);
        $lote->load('ciudad');

        return response()->json($lote, 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $lote = Lote::findOrFail($id);
        $lote->delete();
        return response()->json([
            'message' => "Lote deleted Succesffull"
        ], 200);
    }

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'codigo'    => 'nullable|string|max:255',
            'nombre'    => 'nullable|string|max:255',
            'idCiudad' => 'nullable|integer',
            'estado'    => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Lote
        $query = Lote::query();

        // Aplicamos cada filtro si se encuentra presente en la petición

        // Búsqueda por código (parcial)
        if ($request->filled('codigo')) {
            $codigo = trim($request->input('codigo'));
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

        // Búsqueda por nombre (parcial)
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        // Búsqueda por idPrograma (búsqueda exacta)
        if ($request->filled('idCiudad')) {
            $idCiudad = $request->input('idCiudad');
            $query->where('idCiudad', $idCiudad);
        }

        // Búsqueda por estado (por ejemplo, búsqueda exacta o parcial según convenga)
        if ($request->filled('estado')) {
            $estado = trim($request->input('estado'));
            $query->where('estado', $estado);
        }

        // Se incluyen las relaciones definidas en el modelo, por ejemplo programa y cursos
        $query->with(['ciudad']);

        try {
            // Paginar los resultados
            $lotes = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $lotes
            ]);
        } catch (Exception $ex) {
            Log::channel('stderr')->error('Error en búsqueda de lotes: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.',
            ], 500);
        }
    }
}
