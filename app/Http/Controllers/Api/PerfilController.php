<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Perfil;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PerfilController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perfiles = Perfil::withCount('usuarios')->with('roles')->get();
        return response()->json($perfiles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => "required|string|max:200",
                'descripcion' => "nullable|string"
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $perfil = Perfil::create($validatedData);

        $perfil->load("roles");

        return response()->json($perfil, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $perfil = Perfil::with("roles")->findOrFail($id);
        return response()->json($perfil);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $perfil = Perfil::findOrFail($id);
        $validatedData = $request->validate([
            'nombre' => "sometimes|required|string|max:200",
            'descripcion' => "sometimes|nullable|string"
        ]);

        $perfil->update($validatedData);
        $perfil->load("roles");

        return response()->json($perfil);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $pais = Perfil::findOrFail($id);

        $pais->delete();

        return response()->json(['message' => "Perfil Deleted"]);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // 2. Iniciamos el query builder
        $query = Perfil::query();

        // 3. Aplicamos filtros si vienen en la petición
        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . trim($request->input('nombre')) . '%');
        }

        if ($request->filled('descripcion')) {
            $query->where('descripcion', 'like', '%' . trim($request->input('descripcion')) . '%');
        }

        // 4. Cargamos la relación roles
        $query->with('roles');

        // 5. Ejecutamos la consulta con paginación
        try {
            $perfiles = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $perfiles
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de perfiles: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
