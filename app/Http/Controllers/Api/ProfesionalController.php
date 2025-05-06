<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profesional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ProfesionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profesionales = Profesional::all();
        return response()->json($profesionales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo' => "required|string|max:20",
                'identificacion' => "required|string|max:20",
                'nombreCompleto' => "required|string|max:100",
                'email' => "required|email|unique:profesional,email",
                'titulo' => "required|string|max:200",
                'experiencia' => "required|integer",
                'estado' => "required|string",
                'perfil' => "nullable|string",
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $profesional = Profesional::create($validatedData);

        return response()->json($profesional, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $profesional = Profesional::findOrFail($id);
        return response()->json($profesional);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $profesional = Profesional::findOrFail($id);

        $validatedData = $request->validate(
            [
                'codigo'         => 'sometimes|required|string|max:20',
                'identificacion' => "sometimes|string|max:20",
                'nombreCompleto' => 'sometimes|required|string|max:255',
                'email'          => 'sometimes|required|email|unique:profesional,email,' . $id . ',idProfesional',
                'titulo'         => 'sometimes|required|string|max:255',
                'experiencia'    => 'sometimes|required|integer',
                'estado'         => 'sometimes|required|string',
                'perfil'         => 'sometimes|nullable|string',
            ]
        );

        $profesional->update($validatedData);

        return response()->json($profesional);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $profesional = Profesional::findOrFail($id);
        $profesional->delete();

        return response()->json(["message" => "profesional deleted"]);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'codigo'          => 'nullable|string|max:255',
            'nombreCompleto'  => 'nullable|string|max:255',
            'email'           => 'nullable|email|max:255',
            'titulo'          => 'nullable|string|max:255',
            'experiencia'     => 'nullable|integer|min:0',
            'estado'          => 'nullable|string|max:50',
            'perfil'          => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // 2. Inicializamos el query builder
        $query = Profesional::query();

        // 3. Aplicamos filtros si vienen en la petición
        if ($request->filled('codigo')) {
            $query->where('codigo', 'like', '%' . trim($request->input('codigo')) . '%');
        }

        if ($request->filled('identificacion')) {
            $query->where('identificacion', 'like', '%' . trim($request->input('identificacion')) . '%');
        }

        if ($request->filled('nombreCompleto')) {
            $query->where('nombreCompleto', 'like', '%' . trim($request->input('nombreCompleto')) . '%');
        }

        if ($request->filled('email')) {
            $query->where('email', 'like', '%' . trim($request->input('email')) . '%');
        }

        if ($request->filled('titulo')) {
            $query->where('titulo', 'like', '%' . trim($request->input('titulo')) . '%');
        }

        if ($request->filled('experiencia')) {
            $query->where('experiencia', $request->input('experiencia'));
        }

        if ($request->filled('estado')) {
            $query->where('estado', 'like', '%' . trim($request->input('estado')) . '%');
        }

        if ($request->filled('perfil')) {
            $query->where('perfil', 'like', '%' . trim($request->input('perfil')) . '%');
        }

        // 4. Cargamos la relación especialidades
        $query->with('especialidades');

        // 5. Ejecutamos la consulta con paginación
        try {
            $profesionales = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $profesionales
            ]);
        } catch (\Exception $ex) {
            Log::error('Error en búsqueda de profesionales: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
