<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Curso;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class CursoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $cursos = Curso::with(['programas'])->get();
        return response()->json($cursos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validateData = $request->validate([
                'codigo' => "required|string|max:12",
                'nombre' => "required|string|max:100",
                'codigoGrupo' => "required|string|max:25",
                'cohorte' => "required|numeric",
                'nivel' => 'sometimes|in:Avanzado,Intermedio,Basico',
                'descripcion' => "required|string",
                'creditos' => 'required|numeric',
                'horas' => "required|numeric",
                'modalidad' => 'required|in:Presencial,Virtual',
                'estado' => 'required|in:Activo,Inactivo',
                'programas'       => 'sometimes|array',
                'programas.*'     => 'integer|exists:programa,idPrograma',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $curso = Curso::create($validateData);

            if (! empty($validateData['programas'])) {
                // sync() reemplaza todas las relaciones. attach() añade sin eliminar previas.
                $curso->programas()->sync($validateData['programas']);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'curso'   => $curso->load('programas')
            ], 201);

            // Si se envían programas, sincronizamos la relación
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al crear el curso.',
                'error'   => $e->getMessage()
            ], 500);
        }

        return response()->json($curso);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $curso = Curso::findOrFail($id);
        return response()->json($curso);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $curso = Curso::findOrFail($id);

        $validateData = $request->validate([
            'codigo' => "sometimes|required|string|max:12",
            'nombre' => "sometimes|required|string|max:100",
            'descripcion' => 'sometimes|required|string',
            'codigoGrupo' => "required|string|max:25",
            'cohorte' => "required|numeric",
            'nivel' => 'sometimes|in:Avanzado,Intermedio,Basico',
            'creditos' => "sometimes|required|numeric",
            'modalidad' => 'sometimes|in:Presencial,Virtual',
            'horas' => "sometimes|required|numeric",
            'estado' => 'sometimes|required|in:Activo,Inactivo',
            'programas'       => 'sometimes|array',
            'programas.*'     => 'integer|exists:programa,idPrograma'
        ]);

        try {
            DB::beginTransaction();

            // 3. Actualizar campos del curso
            $curso->update($validateData);

            // 4. Sincronizar programas
            if (array_key_exists('programas', $validateData)) {
                // Reemplaza las relaciones por las enviadas
                $curso->programas()->sync($validateData['programas']);
            }

            DB::commit();

            // 6. Devolver el curso con sus relaciones cargadas
            return response()->json([
                'success' => true,
                'curso'   => $curso->load('programas')
            ], 200);
        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error al actualizar el curso.',
                'error'   => $e->getMessage()
            ], 500);
        }

        //$curso->update($validateData);
        return response()->json($curso);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $curso = Curso::findOrFail($id);
        $curso->delete();
        return response()->json(['message' => 'Curso eliminado correctamente!']);
    }

    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'codigo'      => 'nullable|string|max:100',
            'nombre'      => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'creditos'    => 'nullable|integer',
            'horas'       => 'nullable|integer',
            'estado'      => 'nullable|string|max:50'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta para el modelo Curso
        $query = Curso::query();

        // Aplicamos el filtro para el campo 'codigo' si está presente
        if ($request->filled('codigo')) {
            $codigo = trim($request->input('codigo'));
            $query->where('codigo', 'like', '%' . $codigo . '%');
        }

        // Aplicamos el filtro para el campo 'nombre' si está presente
        if ($request->filled('nombre')) {
            $nombre = trim($request->input('nombre'));
            $query->where('nombre', 'like', '%' . $nombre . '%');
        }

        // Aplicamos el filtro para el campo 'descripcion' si está presente
        if ($request->filled('descripcion')) {
            $descripcion = trim($request->input('descripcion'));
            $query->where('descripcion', 'like', '%' . $descripcion . '%');
        }

        // Filtro para 'creditos' (búsqueda exacta, ya que es un valor numérico)
        if ($request->filled('creditos')) {
            $creditos = $request->input('creditos');
            $query->where('creditos', $creditos);
        }

        // Filtro para 'horas' (búsqueda exacta, ya que es un valor numérico)
        if ($request->filled('horas')) {
            $horas = $request->input('horas');
            $query->where('horas', $horas);
        }

        // Aplicamos el filtro para el campo 'estado' si está presente
        if ($request->filled('estado')) {
            $estado = trim($request->input('estado'));
            $query->where('estado', 'like', '%' . $estado . '%');
        }

        // Incluimos las relaciones definidas en el modelo Curso:
        // - 'programas' para la relación muchos a muchos con Programa
        // - 'horarios' para la relación uno a muchos con Horario
        $query->with(['programas', 'horarios']);

        try {
            // Se recomienda paginar los resultados para evitar sobrecargar la respuesta
            $cursos = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'data'   => $cursos
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de cursos: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.'
            ], 500);
        }
    }
}
