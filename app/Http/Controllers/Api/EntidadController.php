<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidad;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EntidadController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $entidades = Entidad::all();
        return response()->json($entidades);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'codigo' => "required|string|max:16",
                'nombre' => "required|string|max:90",
                'descripcion' => "required|string",
                'estado' => "required|string|in:Activo,Inactivo",
                'contacto' => "required|string|max:100"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $entidad = Entidad::create($validateData);
        return response()->json($entidad, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $entidad = Entidad::findOrFail($id);
        return response()->json($entidad);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $entidad = Entidad::findOrFail($id);

        $validateData = $request->validate([
            'codigo' => "sometimes|required|string|16",
            'nombre' => "sometimes|required|max:90",
            'descripcion' => "required|string",
            'estado' => "required|string|in:Activo,Inactivo",
            'contacto' => "required|string|max:100"
        ]);

        $entidad->update($validateData);
        return response()->json($entidad);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $entidad = Entidad::findOrFail($id);
        $entidad->delete();
        return response()->jsonjson(["Message" => 'Se elimino satisfactoriamente.', "Status" => 200], 200);
    }

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'codigo'      => 'nullable|string|max:100',
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'estado'      => 'nullable|string|max:50',
            'contacto'    => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Entidad
        $query = Entidad::query();

        // Aplicamos el filtro para el campo 'codigo' (búsqueda parcial)
        if ($request->filled('codigo')) {
            $codigo = trim($request->input('codigo'));
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

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

        // Aplicamos el filtro para el campo 'estado' (búsqueda parcial)
        if ($request->filled('estado')) {
            $estado = trim($request->input('estado'));
            $query->where('estado', 'like', '%' . $estado . '%');
        }

        // Aplicamos el filtro para el campo 'contacto' (búsqueda parcial)
        if ($request->filled('contacto')) {
            $contacto = trim($request->input('contacto'));
            $query->where('contacto', 'like', '%' . $contacto . '%');
        }

        try {
            // Se recomienda paginar los resultados para evitar sobrecargar la respuesta
            $entidades = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $entidades
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de entidades: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
