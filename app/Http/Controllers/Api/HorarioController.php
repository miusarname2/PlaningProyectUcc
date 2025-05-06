<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dia;
use App\Models\FranjaHoraria;
use App\Models\Horario;
use App\Models\RolDocente;
use Exception;
use Illuminate\Http\Request;
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
        // 1. Validación
        try {
            $validated = $request->validate([
                'idCurso'                    => 'required|integer|exists:curso,idCurso',
                'idAula'                     => 'nullable|integer|exists:aula,idAula',
                'docentes'                   => 'required|array|min:1',
                'docentes.*.idProfesional'   => 'required|integer|exists:profesional,idProfesional',
                'docentes.*.idRolDocente'    => 'required|integer|exists:rolDocente,idRolDocente',
                'dias'                       => 'required|array|min:1',
                'dias.*'                     => 'required|integer|exists:dia,idDia',
                'hora_inicio'                => 'required|date_format:H:i:s',
                'hora_fin'                   => 'required|date_format:H:i:s|after:hora_inicio',
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $ex->errors(),
            ], 422);
        }

        // 2. Comprobar solapamientos por cada día seleccionado
        foreach ($validated['dias'] as $idDia) {
            $conflict = Horario::where('idAula', $validated['idAula'])
                // horario_dia join implícito via whereHas
                ->whereHas('dias', function ($q) use ($idDia, $validated) {
                    $q->where('dia.idDia', $idDia)
                        ->where('horario_dia.hora_inicio', '<', $validated['hora_fin'])
                        ->where('horario_dia.hora_fin',    '>', $validated['hora_inicio']);
                })
                ->exists();

            if ($conflict) {
                $nombre = Dia::find($idDia)->nombre;
                return response()->json([
                    'success' => false,
                    'message' => "El horario solicitado se solapa con otro existente en el mismo aula el día {$nombre}.",
                ], 409);
            }
        }

        // 3. Crear el horario principal
        $horario = Horario::create([
            'idCurso'       => $validated['idCurso'],
            'idAula'        => $validated['idAula'],
        ]);

        // 4. Asociar días con franjas en horario_dia
        $attachDias = [];
        foreach ($validated['dias'] as $idDia) {
            $attachDias[$idDia] = [
                'hora_inicio' => $validated['hora_inicio'],
                'hora_fin'    => $validated['hora_fin'],
            ];
        }
        $horario->dias()->attach($attachDias);

        // 5. Asociar docentes con roles en horario_profesional
        $attachDocs = [];
        foreach ($validated['docentes'] as $doc) {
            $attachDocs[$doc['idProfesional']] = [
                'idRolDocente' => $doc['idRolDocente'],
            ];
        }
        $horario->profesionales()->attach($attachDocs);

        // 6. Cargar relaciones para la respuesta
        $horario->load(['curso', 'aula', 'dias', 'profesionales']);

        return response()->json([
            'success' => true,
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
        // 1) Cargar el registro existente o lanzar 404
        $horario = Horario::findOrFail($id);

        // 2) Validar datos ( ahora 'dias' es un array opcional )
        try {
            $validated = $request->validate([
                'idCurso'       => 'sometimes|integer|exists:curso,idCurso',
                'idProfesional' => 'sometimes|integer|exists:profesional,idProfesional',
                'idAula'        => 'sometimes|nullable|integer|exists:aula,idAula',
                'dias'          => 'sometimes|array|min:1',
                'dias.*'        => ['required', 'string', 'in:Lunes,Martes,Miércoles,Jueves,Viernes,Sábado,Domingo'],
                'hora_inicio'   => 'sometimes|date_format:H:i:s',
                'hora_fin'      => 'sometimes|date_format:H:i:s|after:hora_inicio',
            ]);
        } catch (ValidationException $ex) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $ex->errors(),
            ], 422);
        }

        // 3) Determinar valores efectivos para chequear solapamientos
        $idAula = $validated['idAula'] ?? $horario->idAula;

        // Si vienen nuevos horarios/días:
        $hora_inicio = $validated['hora_inicio']
            ?? optional($horario->dias()->first()->pivot)->hora_inicio->format('H:i:s');
        $hora_fin    = $validated['hora_fin']
            ?? optional($horario->dias()->first()->pivot)->hora_fin->format('H:i:s');

        // 4) Resolver los IDs de día: o los que trae el request, o los ya asociados
        if (isset($validated['dias'])) {
            $nombres = $validated['dias'];
        } else {
            $nombres = $horario->dias->pluck('nombre')->toArray();
        }
        $diasMapa = \App\Models\Dia::whereIn('nombre', $nombres)
            ->pluck('idDia', 'nombre')
            ->toArray();

        // 5) Chequear solapamientos por cada día
        foreach ($diasMapa as $nombre => $idDia) {
            $conflict = Horario::where('idAula', $idAula)
                ->where('idHorario', '!=', $horario->idHorario)
                ->whereHas('dias', function ($q) use ($idDia, $hora_inicio, $hora_fin) {
                    $q->where('dia.idDia', $idDia)
                        ->wherePivot('hora_inicio', '<', $hora_fin)
                        ->wherePivot('hora_fin',    '>', $hora_inicio);
                })
                ->exists();

            if ($conflict) {
                return response()->json([
                    'success' => false,
                    'message' => "El horario actualizado se solapa con otro existente en el mismo aula el día {$nombre}.",
                ], 409);
            }
        }

        // 6) Actualizar campos en tabla `horario`
        $horario->update(array_filter([
            'idCurso'       => $validated['idCurso']       ?? null,
            'idProfesional' => $validated['idProfesional'] ?? null,
            'idAula'        => array_key_exists('idAula', $validated)
                ? $validated['idAula']
                : null,
        ], function ($v) {
            return !is_null($v);
        }));

        // 7) Sincronizar días + franjas en el pivote
        //    Si no vienen nuevos 'dias', no hablamos el arreglo y dejamos como estaba.
        if (isset($validated['dias'])) {
            $attach = [];
            foreach ($diasMapa as $idDia) {
                $attach[$idDia] = [
                    'hora_inicio' => $hora_inicio,
                    'hora_fin'    => $hora_fin,
                ];
            }
            $horario->dias()->sync($attach);
        }

        // 8) Devolver el recurso con sus relaciones
        $horario->load(['curso', 'profesional', 'aula', 'dias']);

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

        return response()->json(["message" => "Horario Deleted"]);
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
            $query->whereHas('profesional', function ($q) use ($request) {
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
        $query->with(['curso', 'profesional', 'aula', 'aula.sede', 'aula.sede.propietario']);

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
        // 1) Carga de datos con relaciones
        $horarios = Horario::with(['curso', 'profesional', 'aula.sede'])
            ->orderBy('hora_inicio')
            ->get();

        // 2) Definir días de la semana
        $dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

        // 3) Construir lista única de franjas (hora_inicio–hora_fin)
        $franjas = $horarios
            ->map(fn($h) => sprintf(
                '%s - %s',
                $h->hora_inicio->format('H:i'),
                $h->hora_fin->format('H:i')
            ))
            ->unique()
            ->sort()
            ->values()
            ->all();

        // 4) Mapear [“HH:MM–HH:MM”][“Día”] => texto
        $map = [];
        foreach ($horarios as $h) {
            $keyF = sprintf(
                '%s - %s',
                $h->hora_inicio->format('H:i'),
                $h->hora_fin->format('H:i')
            );
            $map[$keyF][$h->dia] = sprintf(
                '%s (Aula %s)%s%s',
                $h->curso->codigo,
                $h->aula->codigo,
                PHP_EOL,
                $h->aula->sede->nombre
            );
        }

        // 5) Crear y poblar spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet       = $spreadsheet->getActiveSheet();

        // 5.1) Encabezados
        $sheet->setCellValue('A1', 'HORAS');
        foreach ($dias as $i => $dia) {
            $col = Coordinate::stringFromColumnIndex($i + 2);
            $sheet->setCellValue("{$col}1", $dia);
        }

        // 5.2) Filas de franjas
        $row = 2;
        foreach ($franjas as $label) {
            $sheet->setCellValue("A{$row}", $label);
            foreach ($dias as $i => $dia) {
                $col = Coordinate::stringFromColumnIndex($i + 2);
                if (! empty($map[$label][$dia])) {
                    $sheet->setCellValue("{$col}{$row}", $map[$label][$dia]);
                    // fondo verde suave
                    $sheet->getStyle("{$col}{$row}")
                        ->getFill()
                        ->setFillType(Fill::FILL_SOLID)
                        ->getStartColor()
                        ->setRGB('C6EFCE');
                }
            }
            $row++;
        }

        // 6) Auto-ajustar anchos
        foreach (range('A', $sheet->getHighestColumn()) as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // 7) Generar XLS y devolver Base64
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
