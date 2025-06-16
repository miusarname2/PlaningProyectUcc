<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profesional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xls;

class ProfesionalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $profesionales = Profesional::with("roles")->get();
        return response()->json($profesionales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'codigo'         => 'required|string|max:20',
                'identificacion' => 'required|string|max:20',
                'nombreCompleto' => 'required|string|max:100',
                'email'          => 'sometimes|email|unique:profesional,email',
                'titulo'         => 'sometimes|nullable|string|max:200',
                'experiencia'    => 'sometimes|nullable|integer',
                'estado'         => 'required|string',
                'perfil'         => 'nullable|string',
                'roles'          => 'sometimes|array',
                'roles.*'        => 'integer|exists:rolDocente,idRolDocente',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        // Valores por defecto
        $validatedData['experiencia'] = $validatedData['experiencia'] ?? 0;
        $validatedData['email']       = $validatedData['email']       ?? '';
        $validatedData['titulo']       = $validatedData['titulo']       ?? '';

        // 1) Crear profesional
        $profesional = Profesional::create($validatedData);

        // 2) Sincronizar roles (si vienen)
        if (! empty($validatedData['roles'])) {
            $profesional->roles()->sync($validatedData['roles']);
        }

        // 3) Devolver recurso con relaciones cargadas
        $profesional->load('roles');

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

        $validatedData = $request->validate([
            'codigo'         => 'sometimes|required|string|max:20',
            'identificacion' => 'sometimes|string|max:20',
            'nombreCompleto' => 'sometimes|required|string|max:255',
            'email'          => 'sometimes|required|email|unique:profesional,email,' . $id . ',idProfesional',
            'titulo'         => 'sometimes|nullable|required|string|max:255',
            'experiencia'    => 'sometimes|required|integer',
            'estado'         => 'sometimes|required|string',
            'perfil'         => 'sometimes|nullable|string',
            'roles'          => 'sometimes|array',
            'roles.*'        => 'integer|exists:rolDocente,idRolDocente',
        ]);

        // 1) Actualizar datos básicos
        $profesional->update($validatedData);

        // 2) Sincronizar roles (si vienen en el request)
        if (array_key_exists('roles', $validatedData)) {
            // Si envían un array vacío, borra todos los roles.
            $profesional->roles()->sync($validatedData['roles']);
        }

        // 3) Recargar roles para la respuesta
        $profesional->load('roles');

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
            'identificacion' => "nullable|string|max:20",
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

        // 4. Ejecutamos la consulta con paginación
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

    public function exportProfesionalesXls()
    {
        // 1) Carga de todos los profesionales
        $profesionales = Profesional::all();

        // 2) Crear el spreadsheet y la hoja activa
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Profesionales');

        // 3) Definir cabeceras: usa los campos fillable de tu modelo
        $headers = [
            'ID',
            'Código',
            'Identificación',
            'Nombre completo',
            'Email',
            'Título',
            'Años de experiencia',
            'Estado',
            'Perfil',
        ];
        foreach ($headers as $idx => $title) {
            $col = Coordinate::stringFromColumnIndex($idx + 1);
            $sheet->setCellValue("{$col}1", $title);
            $sheet->getStyle("{$col}1")->getFont()->setBold(true);
        }

        // 4) Rellenar filas con los datos de cada profesional
        $row = 2;
        foreach ($profesionales as $p) {
            $data = [
                $p->getKey(),           // idProfesional
                $p->codigo,
                $p->identificacion,
                $p->nombreCompleto,
                $p->email,
                $p->titulo,
                $p->experiencia,
                $p->estado,
                $p->perfil,
            ];
            foreach ($data as $i => $val) {
                $col = Coordinate::stringFromColumnIndex($i + 1);
                $sheet->setCellValue("{$col}{$row}", $val);
                // Ajuste de texto si fuera necesario
                $sheet->getStyle("{$col}{$row}")->getAlignment()->setWrapText(true);
            }
            $row++;
        }

        // 5) Auto-ajustar anchos de columna
        foreach (range(1, count($headers)) as $colIndex) {
            $col = Coordinate::stringFromColumnIndex($colIndex);
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // 6) Generar y devolver XLS en base64 (o como descarga directa)
        $writer = new Xls($spreadsheet);
        ob_start();
        $writer->save('php://output');
        $xlsData = ob_get_clean();
        return response()->json([
            'filename' => 'profesionales.xls',
            'base64'   => base64_encode($xlsData),
        ]);
    }
}
