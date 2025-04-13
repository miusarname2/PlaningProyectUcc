<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sede;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class SedeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sede = Sede::with('ciudad')->get();

        return response()->json($sede);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'    => 'required|string|max:255',
                'nombre'    => 'required|string|max:255',
                'descripcion' => 'nullable|string',
                'tipo'      => 'required|string',
                'acceso'    => 'required|string',
                'idCiudad'  => 'required|integer|exists:ciudades,idCiudad'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $sede = Sede::create($validatedData);
        $sede->load('ciudad');

        return response()->json($sede, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $sede = Sede::with('ciudad')->findOrFail($id);
        return response()->json($sede);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $sede = Sede::findOrFail($id);

        $validatedData = $request->validate([
            'codigo'    => 'sometimes|required|string|max:255',
            'nombre'    => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|nullable|string',
            'tipo'      => 'sometimes|required|string',
            'acceso'    => 'sometimes|required|string',
            'idCiudad'  => 'sometimes|required|integer|exists:ciudades,idCiudad'
        ]);

        $sede->update($validatedData);
        $sede->load('ciudad');

        return response()->json($sede);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $sede = Sede::findOrFail($id);
        $sede->delete();

        return response()->json(['message' => 'Sede Deleted Successfully']);
    }

    public function search(Request $request)
    {
        // 1. Validación de la entrada
        $validator = Validator::make($request->all(), [
            'codigo'      => 'nullable|string|max:255',
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'tipo'        => 'nullable|string|max:100',
            'acceso'      => 'nullable|string|max:255',
            'idCiudad'    => 'nullable|integer|exists:ciudad,idCiudad',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors(),
            ], 422);
        }

        // 2. Iniciamos el query builder
        $query = Sede::query();

        // 3. Aplicamos filtros condicionales
        if ($request->filled('codigo')) {
            $query->where('codigo', 'like', '%' . trim($request->input('codigo')) . '%');
        }

        if ($request->filled('nombre')) {
            $query->where('nombre', 'like', '%' . trim($request->input('nombre')) . '%');
        }

        if ($request->filled('descripcion')) {
            $query->where('descripcion', 'like', '%' . trim($request->input('descripcion')) . '%');
        }

        if ($request->filled('tipo')) {
            $query->where('tipo', 'like', '%' . trim($request->input('tipo')) . '%');
        }

        if ($request->filled('acceso')) {
            $query->where('acceso', 'like', '%' . trim($request->input('acceso')) . '%');
        }

        if ($request->filled('idCiudad')) {
            $query->where('idCiudad', $request->input('idCiudad'));
        }

        // 4. Eager‑loading de la relación ciudad
        $query->with('ciudad');

        // 5. Ejecución con paginación
        try {
            $sedes = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $sedes,
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de sedes: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }

}
