<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Especialidad;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class EspecialidadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $especialidades = Especialidad::with("departamento")->get();
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
}
