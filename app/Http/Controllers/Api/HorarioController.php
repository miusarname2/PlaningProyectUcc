<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

        // 2) Obtener IDs de roles especiales
        $ejecutorRoleId = RolDocente::where('nombre', 'Ejecutor')->value('idRolDocente');
        $mentorRoleId   = RolDocente::where('nombre', 'Mentor')->value('idRolDocente');
        $monitorRoleId  = RolDocente::where('nombre', 'Monitor')->value('idRolDocente');

        // 3) Validaciones extra por cada docente y aula
        foreach ($validated['docentes'] as $doc) {
            $teacherId = $doc['idProfesional'];
            $roleId    = $doc['idRolDocente'];

            foreach ($validated['dias'] as $d) {
                $day       = $d['idDia'];
                $startTime = $d['hora_inicio'];
                $endTime   = $d['hora_fin'];

                // 3a) Restricción para Ejecutor: solo 1 asignación en misma franja
                if ($roleId == $ejecutorRoleId) {
                    $exists = Horario::whereHas('profesionales', function ($q) use ($teacherId) {
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
                    $count = DB::table('horario_profesional')
                        ->join('horario_dia', 'horario_profesional.idHorario', '=', 'horario_dia.idHorario')
                        ->where('horario_profesional.idProfesional', $teacherId)
                        ->where('horario_profesional.idRolDocente', $roleId)
                        ->where('horario_dia.idDia', $day)
                        ->where('horario_dia.hora_inicio', '<', $endTime)
                        ->where('horario_dia.hora_fin',   '>', $startTime)
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
                    $aulaBusy = Horario::where('idAula', $validated['idAula'])
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
        $horario = Horario::with(["curso", "profesional", "aula", "aula.sede", 'dias'])->findOrFail($id);
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
            ], [], [
                'fecha_fin.after_or_equal' => 'La fecha de fin debe ser igual o posterior a la fecha de inicio.',
                'dias.*.hora_fin.after'    => 'La hora de fin debe ser posterior a la hora de inicio.',
            ]);

            // Validación manual de rango de horas
            if (!empty($validated['dias'])) {
                foreach ($validated['dias'] as $idx => $d) {
                    if ($d['hora_fin'] <= $d['hora_inicio']) {
                        throw ValidationException::withMessages([
                            "dias.$idx.hora_fin" => ['La hora de fin debe ser posterior a la hora de inicio.'],
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

        // 2) Obtener IDs de roles especiales
        $ejecutorRoleId = RolDocente::where('nombre', 'Ejecutor')->value('idRolDocente');
        $mentorRoleId   = RolDocente::where('nombre', 'Mentor')->value('idRolDocente');
        $monitorRoleId  = RolDocente::where('nombre', 'Monitor')->value('idRolDocente');

        // 3) Validaciones extra si se modifican docentes y días
        if (!empty($validated['docentes']) && !empty($validated['dias'])) {
            foreach ($validated['docentes'] as $doc) {
                $teacherId = $doc['idProfesional'];
                $roleId    = $doc['idRolDocente'];

                foreach ($validated['dias'] as $d) {
                    $day       = $d['idDia'];
                    $startTime = $d['hora_inicio'];
                    $endTime   = $d['hora_fin'];

                    // 3a) Restricción para Ejecutor: una sola asignación en misma franja (excluyendo este)
                    if ($roleId === $ejecutorRoleId) {
                        $exists = Horario::where('idHorario', '!=', $horario->idHorario)
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

                    // 3b) Límite de 4 para Mentor y Monitor en misma franja (excluyendo este)
                    if (in_array($roleId, [$mentorRoleId, $monitorRoleId])) {
                        $count = DB::table('horario_profesional')
                            ->join('horario_dia', 'horario_profesional.idHorario', '=', 'horario_dia.idHorario')
                            ->where('horario_profesional.idProfesional', $teacherId)
                            ->where('horario_profesional.idRolDocente', $roleId)
                            ->where('horario_profesional.idHorario', '!=', $horario->idHorario)
                            ->where('horario_dia.idDia', $day)
                            ->where('horario_dia.hora_inicio', '<', $endTime)
                            ->where('horario_dia.hora_fin',   '>', $startTime)
                            ->count();

                        if ($count >= 4) {
                            return response()->json([
                                'success' => false,
                                'status'  => 409,
                                'message' => 'El docente ha alcanzado el máximo de 4 asignaciones en esa franja.',
                            ], 409);
                        }
                    }

                    // 3c) Disponibilidad de aula: un solo curso por aula en misma franja (excluyendo este)
                    if (array_key_exists('idAula', $validated) && !is_null($validated['idAula'])) {
                        $aulaBusy = Horario::where('idHorario', '!=', $horario->idHorario)
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
        }

        // 4) Actualización en transacción
        DB::beginTransaction();
        try {
            // Actualizar campos básicos
            $horario->update(array_filter([
                'idCurso'      => $validated['idCurso'] ?? null,
                'idAula'       => array_key_exists('idAula', $validated) ? $validated['idAula'] : null,
                'fecha_inicio' => $validated['fecha_inicio'] ?? null,
                'fecha_fin'    => $validated['fecha_fin'] ?? null,
            ], fn($v) => !is_null($v)));

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

        // Cargamos relaciones necesarias (ya no usamos FranjaHoraria)
        $query->with(['curso', 'profesionales', 'aula', 'aula.sede', 'aula.sede.propietario', 'dias']);

        try {
            $horarios = $query->paginate(10);

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

    public function exportXls()
    {
        // 1) Carga de datos con relaciones: incluimos pivot de dias y profesionales
        $horarios = Horario::with([
            'curso.programas',
            'aula.sede.ciudad',
            'aula.sede.propietario',
            'dias',
            'profesionales' => fn($q) => $q->withPivot('idRolDocente')
        ])
            ->get()
            // Ordenamos por hora_inicio del primer día
            ->sortBy(fn(Horario $h) => $h->dias->min(fn($d) => $d->pivot->hora_inicio))
            ->values();

        // 2) Definir días de la semana para la hoja 1
        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        // 3) Primera hoja: Horario de franjas
        $spreadsheet = new Spreadsheet();
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Horario');

        // 3.1) Construir lista única de franjas
        $franjas = $horarios
            ->flatMap(fn($h) => $h->dias->map(fn($d) => sprintf(
                '%s - %s',
                Carbon::parse($d->pivot->hora_inicio)->format('H:i'),
                Carbon::parse($d->pivot->hora_fin)->format('H:i')
            )))
            ->unique()->sort()->values()->all();

        // 3.2) Mapear contenidos
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

        // 3.3) Escribir cabecera hoja 1
        $sheet1->setCellValue('A1', 'HORAS');
        foreach ($diasSemana as $i => $dia) {
            $col = Coordinate::stringFromColumnIndex($i + 2);
            $sheet1->setCellValue("{$col}1", $dia);
            $sheet1->getStyle("{$col}1")->getFont()->setBold(true);
        }

        // 3.4) Filas de franjas
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

        // Auto-ajustar anchos hoja 1
        foreach (range(1, count($diasSemana) + 1) as $colIndex) {
            $col = Coordinate::stringFromColumnIndex($colIndex);
            $sheet1->getColumnDimension($col)->setAutoSize(true);
        }

        // 4) Segunda hoja: Tabla detallada de horarios
        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('Detalle Horarios');
        $headers = [
            'Código de curso',
            'Nombre del curso',
            'Fecha inicio',
            'Fecha fin',
            'Programa',
            'Nivel',
            'Tipo formación',
            'Lote',
            'Ciudad',
            'Entidad',
            'Sede',
            'Aula',
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
        foreach ($horarios as $h) {
            // Datos básicos
            $curso   = $h->curso;
            $programas = $curso->programas->pluck('nombre')->join(', ');
            // Lote asumido de 'codigoGrupo'
            $tipoFormacion = $curso->modalidad;
            $lote = $curso->codigoGrupo;
            $ciudad = optional($h->aula->sede->ciudad)->nombre;
            $entidad = optional($h->aula->sede->propietario)->nombre;
            $sede = optional($h->aula->sede)->nombre;
            $aula = $h->aula->codigo;
            // Roles
            $ej = [];
            $mo = [];
            $me = [];
            foreach ($h->profesionales as $p) {
                $rolDoc = RolDocente::find($p->pivot->idRolDocente);
                $rol    = $rolDoc?->nombre;
                if ($rol === 'Ejecutor') $ej[] = $p->nombreCompleto;
                if ($rol === 'Monitor')  $mo[] = $p->nombreCompleto;
                if ($rol === 'Mentor')   $me[] = $p->nombreCompleto;
            }
            foreach ($h->dias as $d) {
                $data = [
                    $curso->codigo,
                    $curso->nombre,
                    $h->fecha_inicio,
                    $h->fecha_fin,
                    $programas,
                    $curso->nivel,
                    $tipoFormacion,
                    $lote,
                    $ciudad,
                    $entidad,
                    $sede,
                    $aula,
                    $d->pivot->hora_inicio,
                    $d->pivot->hora_fin,
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
        }

        // Auto-ajustar anchos hoja 2
        foreach (range(1, count($headers)) as $i) {
            $sheet2->getColumnDimension(Coordinate::stringFromColumnIndex($i))->setAutoSize(true);
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
