<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Departamento;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
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
                'nombre' => 'required|string|max:90',
                'descripcion' => "required|string"
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
            'codigo' => "required|string|max:15",
            'nombre' => "required|string|max:90",
            'descripcion' => "required|string",
            'creditos' => "required|numeric",
            'horas' => "required|numeric",
            'estado' => "required|in:Activo,Inactivo"
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

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Departamento
        $query = Departamento::query();

        // Aplicamos el filtro para el campo 'nombre' (búsqueda parcial)
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        // Aplicamos el filtro para el campo 'descripcion' (búsqueda parcial)
        if ($request->filled('descripcion')) {
            $descripcion = trim($request->input('descripcion'));
            $query->where('descripcion', 'like', '%' . $descripcion . '%');
        }

        // Incluimos la relación definida 'especialidades'
        $query->with('especialidades');

        try {
            // Paginar los resultados para evitar sobrecargar la respuesta
            $departamentos = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $departamentos
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de departamentos: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
