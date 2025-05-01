<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Arr;
use App\Models\Sede;
use App\Models\SedePrestamo;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $sede = Sede::with(['ciudad', 'propietario', 'prestamos', 'prestatarias'])->get();

        return response()->json($sede);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        DB::beginTransaction();

        try {
            $validatedData = $request->validate([
                'codigo'                  => 'required|string|max:255',
                'nombre'                  => 'required|string|max:255',
                'descripcion'             => 'nullable|string',
                'tipo'                    => 'required|string',
                'acceso'                  => 'required|string',
                'idCiudad'                => 'required|integer|exists:ciudad,idCiudad',
                'idEntidadPropietaria'    => 'required|integer|exists:entidad,idEntidad',
                'entidades_prestatarias'  => 'required|array|min:1',
                'entidades_prestatarias.*.idEntidad'      => 'required|integer|exists:entidad,idEntidad',
                'entidades_prestatarias.*.fechaInicio'    => 'required|date',
                'entidades_prestatarias.*.fechaFin'       => 'required|date|after_or_equal:entidades_prestatarias.*.fechaInicio',
            ]);

            $sedeData = Arr::only($validatedData, [
                'codigo',
                'nombre',
                'descripcion',
                'tipo',
                'acceso',
                'idCiudad',
                'idEntidadPropietaria'
            ]);

            $sede = Sede::create($sedeData);

            foreach ($validatedData['entidades_prestatarias'] as $prest) {
                SedePrestamo::create([
                    'idSede'                 => $sede->idSede,
                    'idEntidadPrestamista'   => $validatedData['idEntidadPropietaria'],
                    'idEntidadPrestataria'   => $prest['idEntidad'],
                    'fechaInicio'            => $prest['fechaInicio'],
                    'fechaFin'               => $prest['fechaFin'],
                    'estado'                 => 'Activo',
                ]);
            }

            DB::commit();

            $sede->load(['ciudad', 'prestamos.prestataria', 'prestamos.prestamista']);

            return response()->json([
                'success' => true,
                'data'    => $sede,
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (Exception $e) {
            DB::rollBack();
            log::error('Error al crear la sede: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error interno.',
            ], 500);
        }
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
        // 1. Recuperamos la sede o fallamos
        $sede = Sede::findOrFail($id);

        // 2. Iniciamos transacción
        DB::beginTransaction();

        try {
            // 3. Validación de datos de la sede y del array de prestatarias
            $validated = $request->validate([
                'codigo'                  => 'sometimes|required|string|max:255',
                'nombre'                  => 'sometimes|required|string|max:255',
                'descripcion'             => 'sometimes|nullable|string',
                'tipo'                    => 'sometimes|required|string',
                'acceso'                  => 'sometimes|required|string',
                'idCiudad'                => 'sometimes|required|integer|exists:ciudad,idCiudad',
                'idEntidadPropietaria'    => 'sometimes|required|integer|exists:entidad,idEntidad',
                'entidades_prestatarias'            => 'sometimes|array',
                'entidades_prestatarias.*.idEntidad'   => 'required_with:entidades_prestatarias|integer|exists:entidad,idEntidad',  // Laravel array validation :contentReference[oaicite:3]{index=3}
                'entidades_prestatarias.*.fechaInicio' => 'required_with:entidades_prestatarias|date',
                'entidades_prestatarias.*.fechaFin'    => 'required_with:entidades_prestatarias|date|after_or_equal:entidades_prestatarias.*.fechaInicio',
            ]);

            // 4. Actualizamos sólo los campos de la sede
            $sedeData = Arr::only($validated, [
                'codigo',
                'nombre',
                'descripcion',
                'tipo',
                'acceso',
                'idCiudad',
                'idEntidadPropietaria'
            ]);
            $sede->update($sedeData);

            // 5. Si traen entidades_prestatarias, sincronizamos
            if (isset($validated['entidades_prestatarias'])) {
                $idsEntrantes = [];
                foreach ($validated['entidades_prestatarias'] as $item) {
                    $prestamo = SedePrestamo::updateOrCreate(
                        [
                            'idSede'               => $sede->idSede,
                            'idEntidadPrestataria' => $item['idEntidad'],
                        ],
                        [
                            'idEntidadPrestamista' => $validated['idEntidadPropietaria'] ?? $sede->idEntidadPropietaria,
                            'fechaInicio'          => $item['fechaInicio'],
                            'fechaFin'             => $item['fechaFin'],
                            'estado'               => 'Activo',
                        ]
                    );
                    $idsEntrantes[] = $item['idEntidad'];
                }

                SedePrestamo::where('idSede', $sede->idSede)
                    ->whereNotIn('idEntidadPrestataria', $idsEntrantes)
                    ->delete();
            }

            // 6. Commit y carga de relaciones
            DB::commit();

            $sede->load(['ciudad', 'prestamos.prestataria', 'prestamos.prestamista']);

            return response()->json([
                'success' => true,
                'data'    => $sede
            ], 200);
        } catch (ValidationException $e) {
            DB::rollBack();                        
            return response()->json([
                'success' => false,
                'message' => 'Error en validación.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();                        
            return response()->json([
                'success' => false,
                'message' => 'Error interno.'
            ], 500);
        }
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
