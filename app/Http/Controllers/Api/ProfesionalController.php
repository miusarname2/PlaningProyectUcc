<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profesional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
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

        if ($request->has('email') && $request->input('email') === '') {
            $request->merge(['email' => null]);
        }
        try {
            $validatedData = $request->validate([
                'codigo'           => 'required|string|max:20',
                'identificacion'   => 'required|string|max:20',
                'nombreCompleto'   => 'required|string|max:100',
                'email'            => 'sometimes|nullable|email|unique:profesional,email',
                'titulo'           => 'sometimes|nullable|string|max:200',
                'experiencia'      => 'sometimes|nullable|integer|min:0',
                'estado'           => 'required|string|in:Activo,Inactivo',
                'perfil'           => 'nullable|string',
                'contrato'         => 'nullable|string|max:255',
                'numeroContratos'  => 'nullable|integer|min:0',
                'disponibilidad'   => 'nullable|string|max:100',
                'idCiudad'         => 'nullable|integer|exists:ciudad,idCiudad',
                'roles'            => 'sometimes|array',
                'roles.*'          => 'integer|exists:rolDocente,idRolDocente',
                'lotes'            => 'sometimes|array',
                'lotes.*'          => 'integer|exists:lote,idLote',
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
        $validatedData['titulo']           = $validatedData['titulo'] ?? '';
        $validatedData['contrato']         = $validatedData['contrato'] ?? '';
        $validatedData['numeroContratos']  = $validatedData['numeroContratos'] ?? 0;
        $validatedData['disponibilidad']   = $validatedData['disponibilidad'] ?? '';

        // Separar relaciones de los atributos del modelo
        $roles = $validatedData['roles'] ?? [];
        $lotes = $validatedData['lotes'] ?? [];

        unset($validatedData['roles'], $validatedData['lotes']);

        // Crear profesional
        $profesional = Profesional::create($validatedData);

        // Sincronizar relaciones
        if (!empty($roles)) {
            $profesional->roles()->sync($roles);
        }

        if (!empty($lotes)) {
            $profesional->lotes()->sync($lotes);
        }

        // Devolver recurso con relaciones cargadas
        $profesional->load('roles', 'lotes', 'ciudad');

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

        // Normalizar email vacío a null para la validación
        if ($request->has('email') && $request->input('email') === '') {
            $request->merge(['email' => null]);
        }

        try {
            $validatedData = $request->validate([
                'codigo'           => 'sometimes|required|string|max:20',
                'identificacion'   => 'sometimes|string|max:20',
                'nombreCompleto'   => 'sometimes|string|max:255',
                'email'            => [
                    'sometimes',
                    'nullable',
                    'email',
                    Rule::unique('profesional', 'email')->ignore($id, 'idProfesional'),
                ],
                'titulo'           => 'sometimes|nullable|string|max:200',
                'experiencia'      => 'sometimes|nullable|integer|min:0',
                'estado'           => 'sometimes|required|string|in:Activo,Inactivo',
                'perfil'           => 'sometimes|nullable|string',
                'contrato'         => 'sometimes|nullable|string|max:255',
                'numeroContratos'  => 'sometimes|nullable|integer|min:0',
                'disponibilidad'   => 'sometimes|nullable|string|max:100',
                'idCiudad'         => 'sometimes|nullable|integer|exists:ciudad,idCiudad',
                'roles'            => 'sometimes|array',
                'roles.*'          => 'integer|exists:rolDocente,idRolDocente',
                'lotes'            => 'sometimes|array',
                'lotes.*'          => 'integer|exists:lote,idLote',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        // Evitar que email nulo sobreescriba accidentalmente si no se desea cambiar
        if (array_key_exists('email', $validatedData) && $validatedData['email'] === null) {
            unset($validatedData['email']);
        }

        // Separar relaciones del modelo
        $validatedData['experiencia'] = $validatedData['experiencia'] ?? 0;
        $roles = $validatedData['roles'] ?? null;
        $lotes = $validatedData['lotes'] ?? null;

        unset($validatedData['roles'], $validatedData['lotes']);

        // 1) Actualizar datos básicos
        $profesional->update($validatedData);

        // 2) Sincronizar relaciones si vienen en la solicitud
        if (!is_null($roles)) {
            $profesional->roles()->sync($roles);
        }

        if (!is_null($lotes)) {
            $profesional->lotes()->sync($lotes);
        }

        // 3) Recargar relaciones
        $profesional->load('roles', 'lotes', 'ciudad');

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
        // 1) Cargar profesionales con su ciudad, roles y lotes
        $profesionales = Profesional::with(['ciudad', 'roles', 'lotes'])->get();

        // 2) Crear spreadsheet
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Profesionales');

        // 3) Definir cabeceras
        $headers = [
            'ID',
            'Código',
            'Identificación',
            'Nombre completo',
            'Email',
            'Años de experiencia',
            'Estado',
            'Perfil',
            'Contrato',
            'Número de contratos',
            'Disponibilidad',
            'Ciudad',
            'Roles',
            'Lotes',
            'Fecha de creación',
            'Fecha de actualización',
        ];

        foreach ($headers as $idx => $title) {
            $col = Coordinate::stringFromColumnIndex($idx + 1);
            $sheet->setCellValue("{$col}1", $title);
            $sheet->getStyle("{$col}1")->getFont()->setBold(true);
        }

        // 4) Agregar filas
        $row = 2;
        foreach ($profesionales as $p) {
            // Preparar cadenas de roles y lotes
            $rolesList = $p->roles->pluck('nombre')->implode(', ');
            $lotesList = $p->lotes->pluck('nombre')->implode(', ');

            $data = [
                $p->getKey(),
                $p->codigo,
                $p->identificacion,
                $p->nombreCompleto,
                $p->email,
                $p->experiencia,
                $p->estado,
                $p->perfil,
                $p->contrato,
                $p->numeroContratos,
                $p->disponibilidad,
                optional($p->ciudad)->nombre,
                $rolesList,
                $lotesList,
                optional($p->created_at)?->format('Y-m-d H:i'),
                optional($p->updated_at)?->format('Y-m-d H:i'),
            ];

            foreach ($data as $i => $val) {
                $col = Coordinate::stringFromColumnIndex($i + 1);
                $sheet->setCellValue("{$col}{$row}", $val);
                $sheet->getStyle("{$col}{$row}")->getAlignment()->setWrapText(true);
            }

            $row++;
        }

        // 5) Ajustar ancho
        foreach (range(1, count($headers)) as $colIndex) {
            $col = Coordinate::stringFromColumnIndex($colIndex);
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        // 6) Exportar XLS
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
