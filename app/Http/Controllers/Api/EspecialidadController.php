<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especialidad;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class EspecialidadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $especialidades = Especialidad::with(["departamento", "profesionales"])->get();
        return response()->json($especialidades);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => "required|string|max:200",
                'codigo' => "required|string|max:100|unique:epecialidad,codigo",
                'descripcion' => "nullable|string",
                'idDepartamento' => "required|exists:departamento,idDepartamento",
                'estado' => "required|boolean"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $especialidad = Especialidad::create($request->all());
        return response()->json([
            'message'     => 'Especialidad creada con éxito',
            'especialidad' => $especialidad
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $especialidad = Especialidad::with('departamento', 'programas', 'profesionales')->find($id);
        if (!$especialidad) {
            return response()->json(['message' => 'Especialidad no encontrada'], 404);
        }
        return response()->json($especialidad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $especialidad = Especialidad::find($id);
        if (!$especialidad) {
            return response()->json(['message' => 'Especialidad no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre'        => 'required|string|max:255',
            // Se excluye el registro actual para validar el código único
            'codigo'        => 'required|string|max:100|unique:especialidad,codigo,' . $especialidad->idEspecialidad . ',idEspecialidad',
            'descripcion'   => 'nullable|string',
            'idDepartamento' => 'required|exists:departamento,idDepartamento',
            'estado'        => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $especialidad->update($request->all());
        return response()->json([
            'message'     => 'Especialidad actualizada con éxito',
            'especialidad' => $especialidad
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $especialidad = Especialidad::find($id);
        if (!$especialidad) {
            return response()->json(['message' => 'Especialidad no encontrada'], 404);
        }
        $especialidad->delete();
        return response()->json(['message' => 'Especialidad eliminada correctamente']);
    }

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'nombre'        => 'nullable|string|max:255',
            'codigo'        => 'nullable|string|max:100',
            'descripcion'   => 'nullable|string|max:1000',
            'idDepartamento' => 'nullable|integer',
            'estado'        => 'nullable|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Especialidad
        $query = Especialidad::query();

        // Filtrado por nombre (búsqueda parcial)
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        // Filtrado por código (búsqueda parcial)
        if ($request->filled('codigo')) {
            $codigo = trim($request->input('codigo'));
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

        // Filtrado por descripción (búsqueda parcial)
        if ($request->filled('descripcion')) {
            $descripcion = trim($request->input('descripcion'));
            $query->where('descripcion', 'like', '%' . $descripcion . '%');
        }

        // Filtrado por idDepartamento (búsqueda exacta)
        if ($request->filled('idDepartamento')) {
            $idDepartamento = $request->input('idDepartamento');
            $query->where('idDepartamento', $idDepartamento);
        }

        // Filtrado por estado (búsqueda parcial)
        if ($request->filled('estado')) {
            $estado = trim($request->input('estado'));
            $query->where('estado', 'like', '%' . $estado . '%');
        }

        // Se incluyen las relaciones definidas en el modelo: departamento, profesionales y programas
        $query->with(['departamento', 'profesionales', 'programas']);

        try {
            // Se recomienda paginar los resultados para evitar sobrecargar la respuesta
            $especialidades = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $especialidades
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de especialidades: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
