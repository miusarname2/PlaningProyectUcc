<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ciudad;
use App\Models\Curso;
use Exception;
use Illuminate\Http\Request;
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
        $cursos = Curso::with(['programas', 'especialidades'])->get();
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
                'descripcion' => "required|string",
                'creditos' => 'required|numeric',
                'horas' => "required|numeric",
                'estado' => 'required|in:Activo,Inactivo'
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        $curso = Curso::create($validateData);
        return response()->json($curso);
    }

    /**
     * Display the specified resource.
     */     public function show(string $id)
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
            'codigo' => "sometimes|required|string|12",
            'nombre' => "sometimes|required|string|max:100",
            'descripcion' => 'sometimes|required|string',
            'creditos' => "sometimes|required|numeric",
            'horas' => "sometimes|required|numeric",
            'estado' => 'sometimes|required|in:Activo,Inactivo'
        ]);

        $curso->update($validateData);
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
        // - 'especialidades' para la relación muchos a muchos con Especialidad
        // - 'horarios' para la relación uno a muchos con Horario
        $query->with(['programas', 'especialidades', 'horarios']);

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
