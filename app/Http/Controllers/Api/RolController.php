<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rol;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class RolController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $rol = Rol::with(['usuarios', 'perfiles'])->get();
        return response()->json($rol);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre'      => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'permisos'    => 'required|string'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $rol = Rol::create($validatedData);

        if ($request->has('usuarios')) {
            // Se espera un arreglo de IDs de usuarios
            $rol->usuarios()->sync($request->input('usuarios'));
        }
        if ($request->has('perfiles')) {
            // Se espera un arreglo de IDs de perfiles
            $rol->perfiles()->sync($request->input('perfiles'));
        }

        $rol->load(['usuarios', 'perfiles']);

        return response()->json($rol, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $rol = Rol::with(['usuario', 'perfiles'])->findOrFail($id);
        return response()->json($rol);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $rol = Rol::findOrFail($id);
        $rol->load(['usuarios', 'perfiles']);

        $validatedData = $request->validate([
            'nombre'      => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'permisos'    => 'sometimes|required|string'
        ]);

        $rol = $rol->update($validatedData);

        if ($request->has('usuarios')) {
            $rol->usuarios()->sync($request->input('usuarios'));
        }
        if ($request->has('perfiles')) {
            $rol->perfiles()->sync($request->input('perfiles'));
        }


        return response()->json($rol);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $rol = Rol::findOrFail($id);

        $rol->delete();

        return response()->json(['message' => "Rol Deleted"]);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'permisos'    => 'nullable|string',  // o JSON, según tu implementación
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // 2. Inicializamos el query builder
        $query = Rol::query();

        // 3. Filtros básicos sobre columnas
        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . trim($request->input('nombre')) . '%');
        }

        if ($request->filled('descripcion')) {
            $query->where('descripcion', 'like', '%' . trim($request->input('descripcion')) . '%');
        }

        if ($request->filled('permisos')) {
            // Si 'permisos' es un JSON o CSV, podrías usar whereJsonContains o LIKE
            $query->where('permisos', 'like', '%' . trim($request->input('permisos')) . '%');
        }

        // 4. Eager‑loading de relaciones y filtros sobre ellas (si fuera necesario)
        // Para incluir todos los usuarios y perfiles vinculados:
        $query->with(['usuarios', 'perfiles']);

        // Ejemplo de cómo filtrar por existencia de usuarios con cierta condición:
        // $query->whereHas('usuarios', function($q) use ($request) {
        //     $q->where('estado', $request->input('usuario_estado'));
        // });

        // 5. Ejecución con paginación
        try {
            $roles = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $roles
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de roles: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
