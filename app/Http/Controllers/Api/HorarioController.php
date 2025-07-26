<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Aula;
use App\Models\Dia;
use App\Models\FranjaHoraria;
use App\Models\Horario;
use App\Models\RolDocente;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xls;
use Throwable;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $horarios = Horario::with(["curso", "profesionales", "aula", "aula.sede.ciudad", 'dias'])->get();

        $horarios->transform(function ($horario) {
            $horario->profesionales->transform(function ($prof) {
                // buscamos el rol según el id del pivot
                $prof->rolDocente = RolDocente::find($prof->pivot->idRolDocente);
                return $prof;
            });
            return $horario;
        });

        return response()->json($horarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
    // 1) Validación básica, incluyendo fechas
    try {
        $validated = $request->validate([
            'idCurso'                  => ['required', 'integer', 'exists:curso,idCurso'],
            'idAula'                   => ['nullable', 'integer', 'exists:aula,idAula'],
            'fecha_inicio'             => ['required', 'date', 'date_format:Y-m-d'],
            'fecha_fin'                => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:fecha_inicio'],
            'docentes'                 => ['required', 'array', 'min:1'],
            'docentes.*.idProfesional' => ['required', 'integer', 'exists:profesional,idProfesional'],
            'docentes.*.idRolDocente'  => ['required', 'integer', 'exists:rolDocente,idRolDocente'],
            'dias'                     => ['required', 'array', 'min:1'],
            'dias.*.idDia'             => ['required', 'integer', 'exists:dia,idDia'],
            'dias.*.hora_inicio'       => ['required', 'date_format:H:i:s'],
            'dias.*.hora_fin'          => ['required', 'date_format:H:i:s'],
        ], [], [
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'dias.*.hora_fin.after'    => 'La hora de fin debe ser posterior a la hora de inicio.',
        ]);

        // Validación manual de hora_inicio < hora_fin
        foreach ($validated['dias'] as $idx => $d) {
            if ($d['hora_fin'] <= $d['hora_inicio']) {
                throw ValidationException::withMessages([
                    "dias.$idx.hora_fin" => ['La hora de fin debe ser posterior a la hora de inicio.'],
                ]);
            }
        }
    } catch (ValidationException $ex) {
        Log::warning('Validación store Horario: ' . json_encode($ex->errors()));
        return response()->json([
            'success' => false,
            'status'  => 422,
            'message' => 'Error en la validación',
            'errors'  => $ex->errors(),
        ], 422);
    }

    if (! is_null($validated['idAula'])) {
        $aula = Aula::find($validated['idAula']);
        if (! $aula || $aula->estado !== 'Disponible') {
            return response()->json([
                'success' => false,
                'status'  => 409,
                'message' => 'El aula no está disponible para asignar.',
            ], 409);
        }
    }

    // 2) Obtener IDs de roles especiales
    $ejecutorRoleId = RolDocente::where('nombre', 'Ejecutor')->value('idRolDocente');
    $mentorRoleId   = RolDocente::where('nombre', 'Mentor')->value('idRolDocente');
    $monitorRoleId  = RolDocente::where('nombre', 'Monitor')->value('idRolDocente');

    // 3) Validaciones extra por cada docente y aula
    foreach ($validated['docentes'] as $doc) {
        $teacherId   = $doc['idProfesional'];
        $roleId      = $doc['idRolDocente'];
        $newStart    = $validated['fecha_inicio'];
        $newEnd      = $validated['fecha_fin'];

        foreach ($validated['dias'] as $d) {
            $day        = $d['idDia'];
            $startTime  = $d['hora_inicio'];
            $endTime    = $d['hora_fin'];

            // 0) Añadimos siempre la restricción de estado Activo y fecha completa
            $fechaOverlapQuery = Horario::where('estado', 'Activo')
                ->where(function ($q) use ($newStart, $newEnd) {
                    $q->where('fecha_fin', '>=', $newStart)
                      ->where('fecha_inicio', '<=', $newEnd);
                });

            // 3a) Restricción para Ejecutor: solo 1 asignación en misma franja
            if ($roleId == $ejecutorRoleId) {
                $exists = (clone $fechaOverlapQuery)
                    ->whereHas('profesionales', function ($q) use ($teacherId) {
                        $q->where('horario_profesional.idProfesional', $teacherId);
                    })
                    ->whereHas('dias', function ($q) use ($day, $startTime, $endTime) {
                        $q->where('horario_dia.idDia', $day)
                          ->where('horario_dia.hora_inicio', '<', $endTime)
                          ->where('horario_dia.hora_fin',   '>', $startTime);
                    })
                    ->exists();

                if ($exists) {
                    return response()->json([
                        'success' => false,
                        'status'  => 409,
                        'message' => 'El ejecutor ya tiene una asignación en esa franja horaria.',
                    ], 409);
                }
            }

            // 3b) Límite de 4 para Mentor y Monitor en misma franja
            if (in_array($roleId, [$mentorRoleId, $monitorRoleId])) {
                $count = (clone $fechaOverlapQuery)
                    ->join('horario_profesional', 'horario.idHorario', '=', 'horario_profesional.idHorario')
                    ->join('horario_dia',          'horario.idHorario', '=', 'horario_dia.idHorario')
                    ->where('horario_profesional.idProfesional', $teacherId)
                    ->where('horario_profesional.idRolDocente',  $roleId)
                    ->where('horario_dia.idDia',                 $day)
                    ->where('horario_dia.hora_inicio', '<',      $endTime)
                    ->where('horario_dia.hora_fin',   '>',      $startTime)
                    ->count();

                if ($count >= 4) {
                    return response()->json([
                        'success' => false,
                        'status'  => 409,
                        'message' => 'El docente ha alcanzado el máximo de 4 asignaciones en esa franja.',
                    ], 409);
                }
            }

            // 3c) Disponibilidad de aula: un solo curso por aula en misma franja
            if (! is_null($validated['idAula'])) {
                $aulaBusy = (clone $fechaOverlapQuery)
                    ->where('idAula', $validated['idAula'])
                    ->whereHas('dias', function ($q) use ($day, $startTime, $endTime) {
                        $q->where('horario_dia.idDia', $day)
                          ->where('horario_dia.hora_inicio', '<', $endTime)
                          ->where('horario_dia.hora_fin',   '>', $startTime);
                    })
                    ->exists();

                if ($aulaBusy) {
                    return response()->json([
                        'success' => false,
                        'status'  => 409,
                        'message' => 'El aula ya está ocupada en esa franja horaria.',
                    ], 409);
                }
            }
        }
    }

    // 4) Creación en transacción
    DB::beginTransaction();
    try {
        $horario = Horario::create([
            'idCurso'      => $validated['idCurso'],
            'idAula'       => $validated['idAula'],
            'fecha_inicio' => $validated['fecha_inicio'],
            'fecha_fin'    => $validated['fecha_fin'],
            'estado'       => 'Activo', // nuevo campo estado por defecto
        ]);

        // 5) Sincronizar días
        $diasSync = [];
        foreach ($validated['dias'] as $d) {
            $diasSync[$d['idDia']] = [
                'hora_inicio' => $d['hora_inicio'],
                'hora_fin'    => $d['hora_fin'],
            ];
        }
        $horario->dias()->attach($diasSync);

        // 6) Sincronizar docentes
        $docsSync = [];
        foreach ($validated['docentes'] as $doc) {
            $docsSync[$doc['idProfesional']] = [
                'idRolDocente' => $doc['idRolDocente'],
            ];
        }
        $horario->profesionales()->attach($docsSync);

        DB::commit();
    } catch (Throwable $e) {
        DB::rollBack();
        Log::error('Error al crear horario: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'status'  => 500,
            'message' => 'Error interno al crear el horario.',
        ], 500);
    }

    // 7) Respuesta final
    $horario->load(['curso', 'aula', 'dias', 'profesionales']);
    return response()->json([
        'success' => true,
        'status'  => 201,
        'data'    => $horario,
    ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $horario = Horario::with(["curso", "profesional", "aula", "aula.sede", 'dias', "aula.sede.ciudad"])->findOrFail($id);
        return response()->json($horario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
    $horario = Horario::findOrFail($id);

    // 1) Validación básica, incluyendo fechas y arrays condicionales
    try {
        $validated = $request->validate([
            'idCurso'                  => ['sometimes', 'integer', 'exists:curso,idCurso'],
            'idAula'                   => ['sometimes', 'nullable', 'integer', 'exists:aula,idAula'],
            'fecha_inicio'             => ['sometimes', 'date', 'date_format:Y-m-d'],
            'fecha_fin'                => ['sometimes', 'date', 'date_format:Y-m-d', 'after_or_equal:fecha_inicio'],
            'docentes'                 => ['sometimes', 'array', 'min:1'],
            'docentes.*.idProfesional' => ['required_with:docentes', 'integer', 'exists:profesional,idProfesional'],
            'docentes.*.idRolDocente'  => ['required_with:docentes', 'integer', 'exists:rolDocente,idRolDocente'],
            'dias'                     => ['sometimes', 'array', 'min:1'],
            'dias.*.idDia'             => ['required_with:dias', 'integer', 'exists:dia,idDia'],
            'dias.*.hora_inicio'       => ['required_with:dias', 'date_format:H:i:s'],
            'dias.*.hora_fin'          => ['required_with:dias', 'date_format:H:i:s'],
            'estado'                   => ['sometimes', 'in:Activo,Inactivo'],
        ], [], [
            'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
            'dias.*.hora_fin.after'    => 'La hora de fin debe ser posterior a la hora de inicio.',
        ]);

        // Validación manual de rango de horas
        if (!empty($validated['dias'])) {
            foreach ($validated['dias'] as $idx => $d) {
                if ($d['hora_fin'] <= $d['hora_inicio']) {
                    throw ValidationException::withMessages([
                        "dias.\$idx.hora_fin" => ['La hora de fin debe ser posterior a la hora de inicio.'],
                    ]);
                }
            }
        }
    } catch (ValidationException $ex) {
        Log::warning('Validación update Horario: ' . json_encode($ex->errors()));
        return response()->json([
            'success' => false,
            'status'  => 422,
            'message' => 'Error en la validación de los datos.',
            'errors'  => $ex->errors(),
        ], 422);
    }

    if (array_key_exists('idAula', $validated) && !is_null($validated['idAula'])) {
        $aula = Aula::find($validated['idAula']);
        if (! $aula || $aula->estado !== 'Disponible') {
            return response()->json([
                'success' => false,
                'status'  => 409,
                'message' => 'El aula no está disponible para asignar.',
            ], 409);
        }
    }

    // 2) Obtener IDs de roles especiales
    $ejecutorRoleId = RolDocente::where('nombre', 'Ejecutor')->value('idRolDocente');
    $mentorRoleId   = RolDocente::where('nombre', 'Mentor')->value('idRolDocente');
    $monitorRoleId  = RolDocente::where('nombre', 'Monitor')->value('idRolDocente');

    // 3) Validaciones extra si se modifican docentes y días
    if (!empty($validated['docentes']) && !empty($validated['dias'])) {
        // Fechas del nuevo rango
        $newStart = $validated['fecha_inicio'] ?? $horario->fecha_inicio;
        $newEnd   = $validated['fecha_fin']    ?? $horario->fecha_fin;

        foreach ($validated['docentes'] as $doc) {
            $teacherId = $doc['idProfesional'];
            $roleId    = $doc['idRolDocente'];

            foreach ($validated['dias'] as $d) {
                $day       = $d['idDia'];
                $startTime = $d['hora_inicio'];
                $endTime   = $d['hora_fin'];

                // --- Query base de solapamiento: sólo horarios activos, excluyendo el mismo registro ---
                $baseQ = Horario::where('estado', 'Activo')
                    ->where('horario.idHorario', '!=', $horario->idHorario)
                    ->where(function ($q) use ($newStart, $newEnd) {
                        $q->where('fecha_fin', '>=', $newStart)
                          ->where('fecha_inicio', '<=', $newEnd);
                    });

                // 3a) Ejecutor: sólo 1 asignación en la misma franja
                if ($roleId === $ejecutorRoleId) {
                    $exists = (clone $baseQ)
                        ->whereHas('profesionales', fn($q) => $q
                            ->where('horario_profesional.idProfesional', $teacherId))
                        ->whereHas('dias', fn($q) => $q
                            ->where('horario_dia.idDia', $day)
                            ->where('horario_dia.hora_inicio', '<', $endTime)
                            ->where('horario_dia.hora_fin',   '>', $startTime))
                        ->exists();

                    if ($exists) {
                        return response()->json([
                            'success' => false,
                            'status'  => 409,
                            'message' => 'El ejecutor ya tiene una asignación en esa franja horaria.',
                        ], 409);
                    }
                }

                // 3b) Mentor/Monitor: máximo 4 asignaciones
                if (in_array($roleId, [$mentorRoleId, $monitorRoleId])) {
                    $count = (clone $baseQ)
                        ->join('horario_profesional', 'horario.idHorario', '=', 'horario_profesional.idHorario')
                        ->join('horario_dia',          'horario.idHorario', '=', 'horario_dia.idHorario')
                        ->where('horario_profesional.idProfesional', $teacherId)
                        ->where('horario_profesional.idRolDocente',  $roleId)
                        ->where('horario_dia.idDia',                 $day)
                        ->where('horario_dia.hora_inicio', '<',      $endTime)
                            ->where('horario_dia.hora_fin',   '>',      $startTime)
                        ->count();

                    if ($count >= 4) {
                        return response()->json([
                            'success' => false,
                            'status'  => 409,
                            'message' => 'El docente ha alcanzado el máximo de 4 asignaciones en esa franja.',
                        ], 409);
                    }
                }

                // 3c) Disponibilidad de aula: sólo un curso por aula
                if (array_key_exists('idAula', $validated) && !is_null($validated['idAula'])) {
                    $aulaBusy = (clone $baseQ)
                        ->where('idAula', $validated['idAula'])
                        ->whereHas('dias', fn($q) => $q
                            ->where('horario_dia.idDia', $day)
                            ->where('horario_dia.hora_inicio', '<', $endTime)
                            ->where('horario_dia.hora_fin',   '>', $startTime))
                        ->exists();

                    if ($aulaBusy) {
                        return response()->json([
                            'success' => false,
                            'status'  => 409,
                            'message' => 'El aula ya está ocupada en esa franja horaria.',
                        ], 409);
                    }
                }
            }
        }
    }

    // 4) Actualización en transacción
    DB::beginTransaction();
    try {
        // Actualizar campos básicos
        $updateData = array_filter([
            'idCurso'      => $validated['idCurso'] ?? null,
            'idAula'       => array_key_exists('idAula', $validated) ? $validated['idAula'] : null,
            'fecha_inicio' => $validated['fecha_inicio'] ?? null,
            'fecha_fin'    => $validated['fecha_fin'] ?? null,
            'estado'       => $validated['estado'] ?? null,
        ], fn($v) => !is_null($v));
        $horario->update($updateData);

        // Sincronizar días
        if (isset($validated['dias'])) {
            $diasSync = [];
            foreach ($validated['dias'] as $d) {
                $diasSync[$d['idDia']] = [
                    'hora_inicio' => $d['hora_inicio'],
                    'hora_fin'    => $d['hora_fin'],
                ];
            }
            $horario->dias()->sync($diasSync);
        }

        // Sincronizar docentes
        if (isset($validated['docentes'])) {
            $docsSync = [];
            foreach ($validated['docentes'] as $doc) {
                $docsSync[$doc['idProfesional']] = [
                    'idRolDocente' => $doc['idRolDocente'],
                ];
            }
            $horario->profesionales()->sync($docsSync);
        }

        DB::commit();
    } catch (Throwable $e) {
        DB::rollBack();
        Log::error('Error al actualizar horario: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'status'  => 500,
            'message' => 'Error interno al actualizar el horario.',
        ], 500);
    }

    // 5) Respuesta final
    $horario->load(['curso', 'aula', 'dias', 'profesionales']);
    return response()->json([
        'success' => true,
        'data'    => $horario,
    ], 200);
}

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $horario = Horario::findOrFail($id);

        $horario->delete();

        return response()->json(["message" => "Horario Deleted", 'status' => 200]);
    }

    public function search(Request $request)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'idCurso'                    => 'nullable|integer',
            'aula_sede'                  => 'nullable|integer',
            'idProfesional'              => 'nullable|integer',
            'idAula'                     => 'nullable|integer',
            'dia'                        => 'nullable|string|max:50',
            'hora_inicio_desde'          => 'nullable|date_format:H:i:s',
            'hora_fin_hasta'             => 'nullable|date_format:H:i:s',
            'curso_nombre'               => 'nullable|string|max:255',
            'curso_codigo'               => 'nullable|string|max:255',
            'curso_creditos'             => 'nullable|integer',
            'curso_horas'                => 'nullable|integer',
            'profesional_codigo'         => 'nullable|string|max:255',
            'profesional_nombreCompleto' => 'nullable|string|max:255',
            'profesional_titulo'         => 'nullable|string|max:255',
            'ciudad_id'                  => 'nullable|integer',
            'entidad_id'                 => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors(),
            ], 422);
        }

        $query = Horario::query();

        // Filtros directos
        if ($request->filled('idCurso')) {
            $query->where('idCurso', $request->input('idCurso'));
        }
        if ($request->filled('idProfesional')) {
            $query->where('idProfesional', $request->input('idProfesional'));
        }
        if ($request->filled('idAula')) {
            $query->where('idAula', $request->input('idAula'));
        }
        if ($request->filled('dia')) {
            $query->where('dia', 'like', '%' . trim($request->input('dia')) . '%');
        }

        // Filtros por hora
        if ($request->filled('hora_inicio_desde')) {
            $query->where('hora_inicio', '>=', $request->input('hora_inicio_desde'));
        }
        if ($request->filled('hora_fin_hasta')) {
            $query->where('hora_fin', '<=', $request->input('hora_fin_hasta'));
        }

        // Filtros por relación: curso
        if ($request->filled('curso_nombre')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('nombre', 'like', '%' . $request->input('curso_nombre') . '%');
            });
        }
        if ($request->filled('curso_codigo')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('codigo', 'like', '%' . $request->input('curso_codigo') . '%');
            });
        }
        if ($request->filled('curso_creditos')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('creditos', $request->input('curso_creditos'));
            });
        }
        if ($request->filled('curso_horas')) {
            $query->whereHas('curso', function ($q) use ($request) {
                $q->where('horas', $request->input('curso_horas'));
            });
        }

        // Filtros por relación: profesional
        if ($request->filled('profesional_codigo')) {
            $query->whereHas('profesionales', function ($q) use ($request) {
                $q->where('codigo', 'like', '%' . $request->input('profesional_codigo') . '%');
            });
        }
        if ($request->filled('profesional_nombreCompleto')) {
            $query->whereHas('profesional', function ($q) use ($request) {
                $q->where('nombreCompleto', 'like', '%' . $request->input('profesional_nombreCompleto') . '%');
            });
        }
        if ($request->filled('profesional_titulo')) {
            $query->whereHas('profesional', function ($q) use ($request) {
                $q->where('titulo', 'like', '%' . $request->input('profesional_titulo') . '%');
            });
        }

        // Filtros por relación: sede y ciudad
        if ($request->filled('aula_sede')) {
            $query->whereHas('aula', function ($q) use ($request) {
                $q->where('idSede', $request->input('aula_sede'));
            });
        }
        if ($request->filled('ciudad_id')) {
            $query->whereHas('aula.sede', function ($q) use ($request) {
                $q->where('idCiudad', $request->input('ciudad_id'));
            });
        }

        // Filtro por entidad propietaria de la sede
        if ($request->filled('entidad_id')) {
            $query->whereHas('aula.sede.propietario', function ($q) use ($request) {
                $q->where('idEntidad', $request->input('entidad_id'));
            });
        }

        // Cargamos relaciones necesarias (ya no usamos FranjaHoraria) ["curso", "profesional", "aula", "aula.sede", 'dias',"aula.sede.ciudad"]
        $query->with(['curso', 'profesionales', 'aula', 'aula.sede', 'aula.sede.propietario', 'dias', 'aula.sede.ciudad']);


        try {
            $horarios = $query->paginate(50);

            $coleccion = $horarios->getCollection();

            // 2) Transformarla igual que en tu index()
            $coleccion->transform(function ($horario) {
                $horario->profesionales->transform(function ($prof) {
                    $prof->rolDocente = RolDocente::find($prof->pivot->idRolDocente);
                    return $prof;
                });
                return $horario;
            });

            // 3) Reemplazar la colección del paginador
            $horarios->setCollection($coleccion);

            return response()->json([
                'status' => 'success',
                'data'   => $horarios,
            ]);
        } catch (Exception $ex) {
            Log::error('Error en búsqueda de horarios: ' . $ex->getMessage());
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error interno del servidor.',
            ], 500);
        }
    }

    public function exportXls(Request $request)
    {
        $filters = $request->all();

        // 1) Carga de datos con relaciones
        $query = Horario::with([
            'curso.programas',
            'curso.lote',                    // cargar lote
            'aula.sede.ciudad',
            'aula.sede.propietario',
            'dias',
            'profesionales' => fn($q) => $q->withPivot('idRolDocente')
        ]);

        if (!empty($filters['ciudad_id'])) {
            $query->whereHas('aula.sede', fn($q) => $q->where('idCiudad', $filters['ciudad_id']));
        }
        if (!empty($filters['entidad_id'])) {
            $query->whereHas('aula.sede.propietario', fn($q) => $q->where('idEntidad', $filters['entidad_id']));
        }
        if (!empty($filters['aula_sede'])) {
            $query->whereHas('aula', fn($q) => $q->where('idSede', $filters['aula_sede']));
        }
        if (!empty($filters['idAula'])) {
            $query->where('idAula', $filters['idAula']);
        }
        if (!empty($filters['idCurso'])) {
            $query->where('idCurso', $filters['idCurso']);
        }
        if (!empty($filters['profesional_codigo'])) {
            $query->whereHas('profesionales', fn($q) => $q->where('codigo', $filters['profesional_codigo']));
        }

        $horarios = $query
            ->get()
            ->sortBy(fn(Horario $h) => optional($h->dias->min(fn($d) => optional($d->pivot)->hora_inicio)))
            ->values();

        // Días de la semana
        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

        // --- Hoja 1: Horario de franjas (sin cambios) ---
        $spreadsheet = new Spreadsheet();
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Horario');

        $franjas = $horarios
            ->flatMap(fn($h) => $h->dias->map(fn($d) => sprintf(
                '%s - %s',
                Carbon::parse($d->pivot->hora_inicio)->format('H:i'),
                Carbon::parse($d->pivot->hora_fin)->format('H:i')
            )))
            ->unique()->sort()->values()->all();

        // Construir mapa para Hoja 1
        $map = [];
        foreach ($horarios as $h) {
            foreach ($h->dias as $d) {
                $label = sprintf(
                    '%s - %s',
                    Carbon::parse($d->pivot->hora_inicio)->format('H:i'),
                    Carbon::parse($d->pivot->hora_fin)->format('H:i')
                );
                $diaNombre = $diasSemana[$d->idDia - 1] ?? "Día {$d->idDia}";
                $map[$label][$diaNombre][] = sprintf(
                    '%s (Aula %s)%s%s',
                    $h->curso->codigo,
                    $h->aula->codigo,
                    PHP_EOL,
                    $h->aula->sede->nombre
                );
            }
        }

        // Cabecera Hoja 1
        $sheet1->setCellValue('A1', 'HORAS');
        foreach ($diasSemana as $i => $dia) {
            $col = Coordinate::stringFromColumnIndex($i + 2);
            $sheet1->setCellValue("{$col}1", $dia);
            $sheet1->getStyle("{$col}1")->getFont()->setBold(true);
        }

        // Filas Franjas
        $row = 2;
        foreach ($franjas as $label) {
            $sheet1->setCellValue("A{$row}", $label);
            $sheet1->getStyle("A{$row}")->getFont()->setBold(true);
            foreach ($diasSemana as $i => $dia) {
                $col = Coordinate::stringFromColumnIndex($i + 2);
                if (!empty($map[$label][$dia])) {
                    $text = implode(PHP_EOL . PHP_EOL, $map[$label][$dia]);
                    $sheet1->setCellValue("{$col}{$row}", $text);
                    $sheet1->getStyle("{$col}{$row}")
                        ->getFill()->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()->setRGB('C6EFCE');
                    $sheet1->getStyle("{$col}{$row}")->getAlignment()->setWrapText(true);
                }
            }
            $row++;
        }
        foreach (range(1, count($diasSemana) + 1) as $colIndex) {
            $col = Coordinate::stringFromColumnIndex($colIndex);
            $sheet1->getColumnDimension($col)->setAutoSize(true);
        }

        // --- Hoja 2: Detalle Horarios (UN SOLO REGISTRO POR CURSO) ---
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Detalle Horarios');

        $headers = [
            'Código de curso',
            'Nombre del curso',
            'Fecha creación',
            'Fecha inicio',
            'Fecha fin',
            'Programa',
            'Nivel',
            'Número de horas',
            'Tipo formación',
            'Lote',
            'Ciudad',
            'Ubicación',
            'Entidad',
            'Sede',
            'Aula',
            'Día',
            'Hora inicio',
            'Hora fin',
            'Ejecutor',
            'Monitor',
            'Mentor'
        ];
        foreach ($headers as $idx => $title) {
            $col = Coordinate::stringFromColumnIndex($idx + 1);
            $sheet2->setCellValue("{$col}1", $title);
            $sheet2->getStyle("{$col}1")->getFont()->setBold(true);
        }

        $row = 2;
        // Recorremos cada curso único
        foreach ($horarios->unique(fn($h) => $h->idCurso) as $h) {
            $curso       = $h->curso;
            $programas   = $curso->programas->pluck('nombre')->join(', ');
            $tipoForm    = $curso->modalidad;
            // Nuevo: lote a partir de la relación
            $loteRel     = $curso->lote;
            $lote        = $loteRel
                ? sprintf('(%s) %s', $loteRel->codigo, $loteRel->nombre)
                : '';

            $ciudad      = optional($h->aula->sede->ciudad)->nombre;
            $acceso      = optional($h->aula->sede)->acceso;
            $ubicacion   = trim(implode(' - ', array_filter([$acceso, $ciudad])));
            $entidad     = optional($h->aula->sede->propietario)->nombre;
            $sede        = optional($h->aula->sede)->nombre;
            $aula        = $h->aula->codigo;

            // Roles
            $ej = $mo = $me = [];
            foreach ($h->profesionales as $p) {
                $nombreP = $p->nombreCompleto;
                $rolDoc  = RolDocente::find($p->pivot->idRolDocente)?->nombre;
                match ($rolDoc) {
                    'Ejecutor' => $ej[] = $nombreP,
                    'Monitor'  => $mo[] = $nombreP,
                    'Mentor'   => $me[] = $nombreP,
                    default    => null,
                };
            }

            // Tomamos sólo el primer día para no duplicar
            $firstDia = $h->dias->first();
            if ($firstDia) {
                $diaNombre  = $diasSemana[$firstDia->idDia - 1] ?? "Día {$firstDia->idDia}";
                $horaInicio = $firstDia->pivot->hora_inicio;
                $horaFin    = $firstDia->pivot->hora_fin;
            } else {
                $diaNombre = $horaInicio = $horaFin = '';
            }

            $data = [
                $curso->codigo,
                $curso->nombre,
                $curso->created_at->format('Y-m-d'),
                $h->fecha_inicio,
                $h->fecha_fin,
                $programas,
                $curso->nivel,
                $curso->horas,
                $tipoForm,
                $lote,
                $ciudad,
                $ubicacion,
                $entidad,
                $sede,
                $aula,
                $diaNombre,
                $horaInicio,
                $horaFin,
                implode(', ', $ej),
                implode(', ', $mo),
                implode(', ', $me),
            ];

            foreach ($data as $i => $val) {
                $col = Coordinate::stringFromColumnIndex($i + 1);
                $sheet2->setCellValue("{$col}{$row}", $val);
                $sheet2->getStyle("{$col}{$row}")->getAlignment()->setWrapText(true);
            }
            $row++;
        }

        foreach (range(1, count($headers)) as $i) {
            $sheet2->getColumnDimension(
                Coordinate::stringFromColumnIndex($i)
            )->setAutoSize(true);
        }

        // 5) Generar y enviar XLS
        $writer = new Xls($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $xlsData = ob_get_clean();

        return response()->json([
            'filename' => 'horario.xls',
            'base64'   => base64_encode($xlsData),
        ]);
    }
}
