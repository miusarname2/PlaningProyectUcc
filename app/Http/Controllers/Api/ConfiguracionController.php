<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Configuracion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ConfiguracionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $configuraciones = Configuracion::all();
            return response()->json($configuraciones);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al obtener configuraciones',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'clave' => 'required|string|unique:configuraciones,clave',
            'valor' => 'nullable|string',
            'tipo' => 'string|in:string,boolean,integer,float,json',
            'descripcion' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $configuracion = Configuracion::create($request->all());
            return response()->json($configuracion, 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al crear configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $configuracion = Configuracion::findOrFail($id);
            return response()->json($configuracion);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Configuración no encontrada',
                'message' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $configuracion = Configuracion::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'clave' => 'sometimes|required|string|unique:configuraciones,clave,' . $id,
            'valor' => 'nullable|string',
            'tipo' => 'sometimes|string|in:string,boolean,integer,float,json',
            'descripcion' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $configuracion->update($request->all());
            return response()->json($configuracion);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al actualizar configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $configuracion = Configuracion::findOrFail($id);
            $configuracion->delete();
            return response()->json(['message' => 'Configuración eliminada correctamente']);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al eliminar configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener el valor de una configuración específica
     */
    public function getValue(string $clave)
    {
        try {
            Log::info("🔍 Consultando configuración: {$clave}");

            $config = Configuracion::where('clave', $clave)->first();

            if (!$config) {
                Log::warning("⚠️ Configuración no encontrada: {$clave}");
                return response()->json([
                    'clave' => $clave,
                    'valor' => null
                ]);
            }

            Log::info("✅ Configuración obtenida: {$clave} = {$config->valor} (tipo: {$config->tipo})");

            return response()->json([
                'clave' => $clave,
                'valor' => filter_var($config->valor, FILTER_VALIDATE_BOOLEAN),
                'tipo' => $config
            ]);
        } catch (\Exception $e) {
            Log::error("❌ Error al obtener configuración {$clave}: " . $e->getMessage());
            return response()->json([
                'error' => 'Error al obtener configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Establecer el valor de una configuración específica
     */
    public function setValue(Request $request, string $clave)
    {
        $validator = Validator::make($request->all(), [
            'valor' => 'required',
            'tipo' => 'string|in:string,boolean,integer,float,json',
            'descripcion' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $configuracion = Configuracion::setValue(
                $clave,
                $request->valor,
                $request->tipo ?? 'string',
                $request->descripcion
            );

            return response()->json($configuracion);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al establecer configuración',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
