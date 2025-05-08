<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dia;
use App\Models\FranjaHoraria;
use App\Models\Horario;
use App\Models\RolDocente;
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
        // 1) Validación básica
        try {
            $validated = $request->validate([
                'idCurso'                  => 'required|integer|exists:curso,idCurso',
                'idAula'                   => 'nullable|integer|exists:aula,idAula',
                'docentes'                 => 'required|array|min:1',
                'docentes.*.idProfesional' => 'required|integer|exists:profesional,idProfesional',
                'docentes.*.idRolDocente'  => 'required|integer|exists:rolDocente,idRolDocente',
                'dias'                     => 'required|array|min:1',
                'dias.*.idDia'             => 'required|integer|exists:dia,idDia',
                'dias.*.hora_inicio'       => 'required|date_format:H:i:s',
                'dias.*.hora_fin'          => 'required|date_format:H:i:s|after:dias.*.hora_inicio',
            ]);
        } catch (ValidationException $ex) {
            Log::warning('Validación update Horario: ' . json_encode($ex->errors()));
            return response()->json([
                'success' => false,
                'status' => 422,
                'message' => 'Error en la validación',
                'errors'  => $ex->errors(),
            ], 422);
        }

        // 2) IDs de roles con límite
        $limitRoleIds = RolDocente::whereIn('nombre', ['Tutor', 'Mentor'])
            ->pluck('idRolDocente')
            ->toArray();

        // 3) Validaciones extra por cada docente
        foreach ($validated['docentes'] as $doc) {
            $teacherId = $doc['idProfesional'];

            // 3a) Conflicto de horario
            foreach ($validated['dias'] as $d) {
                $busy = Horario::where('idAula', $validated['idAula'])
                    ->whereHas('profesionales', function ($q) use ($teacherId) {
                        $q->where('horario_profesional.idProfesional', $teacherId);
                    })
                    ->whereHas('dias', function ($q) use ($d) {
                        $q->where('horario_dia.idDia', $d['idDia'])
                            ->where('horario_dia.hora_inicio', '<', $d['hora_fin'])
                            ->where('horario_dia.hora_fin', '>', $d['hora_inicio']);
                    })->exists();

                if ($busy) {
                    return response()->json([
                        'success' => false,
                        'status' => 409,
                        'message' => 'Teacher, busy at that time',
                    ], 409);
                }
            }

            // 3b) Límite de 4 asignaciones como Tutor/Mentor
            $assignCount = DB::table('horario_profesional')
                ->where('idProfesional', $teacherId)
                ->whereIn('idRolDocente', $limitRoleIds)
                ->count();

            if ($assignCount >= 4) {
                return response()->json([
                    'success' => false,
                    'status' => 409,
                    'message' => 'Teacher, has reached the maximum number of teaching and tutoring assignments.',
                ], 409);
            }
        }

        // 4) Creación del Horario
        $horario = Horario::create([
            'idCurso' => $validated['idCurso'],
            'idAula'  => $validated['idAula'],
        ]);

        // 5) Sincronizar días
        $attachDias = [];
        foreach ($validated['dias'] as $d) {
            $attachDias[$d['idDia']] = [
                'hora_inicio' => $d['hora_inicio'],
                'hora_fin'    => $d['hora_fin'],
            ];
        }
        $horario->dias()->attach($attachDias);

        // 6) Sincronizar docentes
        $attachDocs = [];
        foreach ($validated['docentes'] as $doc) {
            $attachDocs[$doc['idProfesional']] = [
                'idRolDocente' => $doc['idRolDocente'],
            ];
        }
        $horario->profesionales()->attach($attachDocs);

        // 7) Respuesta
        $horario->load(['curso', 'aula', 'dias', 'profesionales']);
        return response()->json(['success' => true,'status' => 201, 'data' => $horario], 201);
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

        // 1) Validación básica
        try {
            $validated = $request->validate([
                'idCurso'                   => 'sometimes|integer|exists:curso,idCurso',
                'idAula'                    => 'sometimes|nullable|integer|exists:aula,idAula',
                'docentes'                  => 'sometimes|array|min:1',
                'docentes.*.idProfesional'  => 'sometimes|integer|exists:profesional,idProfesional',
                'docentes.*.idRolDocente'   => 'sometimes|integer|exists:rolDocente,idRolDocente',
                'dias'                      => 'sometimes|array|min:1',
                'dias.*.idDia'              => 'required_with:dias|integer|exists:dia,idDia',
                'dias.*.hora_inicio'        => 'required_with:dias|date_format:H:i:s',
                'dias.*.hora_fin'           => 'required_with:dias|date_format:H:i:s|after:dias.*.hora_inicio',
            ]);
        } catch (ValidationException $ex) {
            Log::warning('Validación update Horario: ' . json_encode($ex->errors()));
            return response()->json([
                'success' => false,
                'status' => 422,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $ex->errors(),
            ], 422);
        }

        // 2) IDs de roles con límite
        $limitRoleIds = RolDocente::whereIn('nombre', ['Tutor', 'Mentor'])
            ->pluck('idRolDocente')
            ->toArray();

        // 3) Validaciones extra
        if (!empty($validated['docentes']) && !empty($validated['dias'])) {
            foreach ($validated['docentes'] as $doc) {
                $teacherId = $doc['idProfesional'];

                // 3a) Conflicto de horario (excluye este Horario)
                foreach ($validated['dias'] as $d) {
                    $busy = Horario::where('idAula', $validated['idAula'] ?? $horario->idAula)
                        ->where('idHorario', '!=', $horario->idHorario)
                        ->whereHas(
                            'profesionales',
                            fn($q) =>
                            $q->where('horario_profesional.idProfesional', $teacherId)
                        )
                        ->whereHas('dias', function ($q) use ($d) {
                            $q->where('horario_dia.idDia', $d['idDia'])
                                ->where('horario_dia.hora_inicio', '<', $d['hora_fin'])
                                ->where('horario_dia.hora_fin', '>', $d['hora_inicio']);
                        })->exists();

                    if ($busy) {
                        return response()->json([
                            'success' => false,
                            'status' => 409,
                            'message' => 'Teacher, busy at that time',
                        ], 409);
                    }
                }

                // 3b) Límite de 4 asignaciones (excluye este Horario)
                $assignCount = DB::table('horario_profesional')
                    ->where('idProfesional', $teacherId)
                    ->whereIn('idRolDocente', $limitRoleIds)
                    ->where('idHorario', '!=', $horario->idHorario)
                    ->count();

                if ($assignCount > 4) {
                    return response()->json([
                        'success' => false,
                        'status' => 409,
                        'message' => 'Teacher, has reached the maximum number of teaching and tutoring assignments.',
                    ], 409);
                }
            }
        }

        // 4) Actualizar campos básicos
        $horario->update(array_filter([
            'idCurso' => $validated['idCurso'] ?? null,
            'idAula'  => array_key_exists('idAula', $validated) ? $validated['idAula'] : null,
        ], fn($v) => !is_null($v)));

        // 5) Sincronizar días
        if (isset($validated['dias'])) {
            $attach = [];
            foreach ($validated['dias'] as $d) {
                $attach[$d['idDia']] = [
                    'hora_inicio' => $d['hora_inicio'],
                    'hora_fin'    => $d['hora_fin'],
                ];
            }
            $horario->dias()->sync($attach);
        }

        // 6) Sincronizar docentes
        if (isset($validated['docentes'])) {
            $attach = [];
            foreach ($validated['docentes'] as $doc) {
                $attach[$doc['idProfesional']] = [
                    'idRolDocente' => $doc['idRolDocente'],
                ];
            }
            $horario->profesionales()->sync($attach);
        }

        // 7) Respuesta
        $horario->load(['curso', 'aula', 'dias', 'profesionales']);
        return response()->json(['success' => true, 'data' => $horario], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $horario = Horario::findOrFail($id);

        $horario->delete();

        return response()->json(["message" => "Horario Deleted",'status' => 200]);
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
        $query->with(['curso', 'profesionales', 'aula', 'aula.sede', 'aula.sede.propietario','dias']);

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
        // 1) Carga de datos con relaciones: incluimos pivot de dias
        $horarios = Horario::with([
            'curso',
            'aula.sede',
            'dias'  // trae pivot(hora_inicio, hora_fin)
        ])
            ->get()
            // Ordenamos en PHP por hora_inicio del primer día (opcional)
            ->sortBy(fn(Horario $h) => $h->dias->min(fn($d) => $d->pivot->hora_inicio))
            ->values();

        // 2) Definir días de la semana
        $diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes','Sabado'];

        // 3) Construir lista única de franjas (ej. "07:00-08:00")
        $franjas = $horarios
            ->flatMap(fn($h) => $h->dias->map(function ($d) {
                return sprintf(
                    '%s - %s',
                    \Carbon\Carbon::parse($d->pivot->hora_inicio)->format('H:i'),
                    \Carbon\Carbon::parse($d->pivot->hora_fin)->format('H:i')
                );
            }))
            ->unique()
            ->sort()
            ->values()
            ->all();

        // 4) Mapear: [franja][díaNombre] => texto a mostrar
        $map = [];
        foreach ($horarios as $h) {
            foreach ($h->dias as $d) {
                $franjaLabel = sprintf(
                    '%s - %s',
                    \Carbon\Carbon::parse($d->pivot->hora_inicio)->format('H:i'),
                    \Carbon\Carbon::parse($d->pivot->hora_fin)->format('H:i')
                );
                $diaNombre = $diasSemana[$d->idDia - 1] ?? "Día {$d->idDia}";
                $map[$franjaLabel][$diaNombre][] = sprintf(
                    '%s (Aula %s)%s%s',
                    $h->curso->codigo,
                    $h->aula->codigo,
                    PHP_EOL,
                    $h->aula->sede->nombre
                );
            }
        }

        // 5) Crear y poblar spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();

        // 5.1) Cabeceras
        $sheet->setCellValue('A1', 'HORAS');
        foreach ($diasSemana as $i => $dia) {
            $col = Coordinate::stringFromColumnIndex($i + 2);
            $sheet->setCellValue("{$col}1", $dia);
            // Negrita
            $sheet->getStyle("{$col}1")->getFont()->setBold(true);
        }

        // 5.2) Filas de franjas
        $row = 2;
        foreach ($franjas as $label) {
            $sheet->setCellValue("A{$row}", $label);
            $sheet->getStyle("A{$row}")->getFont()->setBold(true);

            foreach ($diasSemana as $i => $dia) {
                $col = Coordinate::stringFromColumnIndex($i + 2);
                if (! empty($map[$label][$dia])) {
                    // Si hay varias clases en la misma franja/día, unimos por doble salto
                    $text = implode(PHP_EOL . PHP_EOL, $map[$label][$dia]);
                    $sheet->setCellValue("{$col}{$row}", $text);

                    // Fondo verde suave
                    $sheet->getStyle("{$col}{$row}")
                        ->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()
                        ->setRGB('C6EFCE');

                    // Ajuste de texto y alineación
                    $sheet->getStyle("{$col}{$row}")
                        ->getAlignment()->setWrapText(true);
                }
            }

            $row++;
        }

        // 6) Auto-ajustar anchos de columna
        foreach (range(1, count($diasSemana) + 1) as $colIndex) {
            $col = Coordinate::stringFromColumnIndex($colIndex);
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // 7) Generar y enviar XLS en base64
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
