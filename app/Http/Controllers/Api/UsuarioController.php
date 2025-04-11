<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;


class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $usuarios = Usuario::with(['roles','usuarioPerfil'])->get();
            return response()->json($usuarios);
        } catch (Exception $e) {
            return response()->json([
                'error' => 'Ocurrió un error al obtener los usuarios',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'username' => 'required|string|max:50',
                'nombreCompleto' => 'required|string|max:60',
                'email'          => 'required|email|max:100|unique:usuario,email',
                'password'       => 'required|string|min:6',
                'estado'         => 'required|in:Activo,Inactivo',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en la validación de los datos.',
                'errors'  => $e->errors()
            ], 422);
        }

        // Hashea la contraseña antes de guardarla
        $validatedData['password'] = Hash::make($validatedData['password']);

        $validatedData['ultimoAcceso'] = now();

        $usuario = Usuario::create($validatedData);
        return response()->json($usuario, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $usuario = Usuario::with('roles')->findOrFail($id);
        return response()->json($usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);

        $rules = [
            'username'  => 'sometimes|required|string|max:50',
            'nombreCompleto' => 'sometimes|required|string|max:60',
            'email'          => "sometimes|required|email|max:100",
            'estado'         => 'sometimes|required|in:Activo,Inactivo',
            'password'       => 'sometimes|required|string|min:6'
        ];

        $validatedData = $request->validate($rules);

        if (isset($validatedData['password'])) {
            // Hashear nueva contraseña si se envía
            $validatedData['password'] = Hash::make($validatedData['password']);
        }

        $usuario->update($validatedData);
        return response()->json($usuario);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $usuario = Usuario::findOrFail($id);
        $usuario->delete();

        return response()->json(['message' => 'Usuario eliminado correctamente']);
    }

    /**
     * Realiza el login del usuario comprobando las credenciales.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string'
        ]);

        // Intenta autenticar al usuario usando la sesión
        if (!Auth::attempt($credentials)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales incorrectas',
                'errors' => ['email' => ['Verifica tus credenciales']]
            ], 401);
        }

        // Usuario autenticado (sesión activa)
        $usuario = Auth::user();
        $usuario->ultimoAcceso = now();
        $usuario->save();

        // Genera token de API (Sanctum)
        $token = $usuario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login exitoso',
            'usuario' => $usuario->load('roles'),
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * Muestra los permisos del usuario a partir de sus roles.
     */
    public function permisos($id)
    {
        // Se asume que la relación en el modelo Usuario es 'roles'
        // y que en el modelo Rol existe el atributo 'permisos'
        $usuario = Usuario::with('roles')->findOrFail($id);

        // Recolectar los permisos de cada rol
        $permisos = $usuario->roles->pluck('permisos')->unique()->filter();

        return response()->json([
            'usuario'   => $usuario->nombre_usuario,
            'permisos'  => $permisos
        ]);
    }

    /**
     * Método para buscar usuarios por username, email, estado, password o nombreCompleto.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        // Validación de la entrada: cada campo es opcional y se valida su tipo.
        $validator = Validator::make($request->all(), [
            'username'      => 'nullable|string|max:255',
            'email'         => 'nullable|email|max:255',
            'estado'        => 'nullable|string|max:50',
            'password'      => 'nullable|string|max:255',
            'nombreCompleto'=> 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'mensaje' => 'Error en los datos ingresados.',
                'errores' => $validator->errors()
            ], 422);
        }

        // Inicializamos la consulta
        $query = Usuario::query();

        // Aplicamos cada filtro si se encuentra presente en la petición
        if ($request->filled('username')) {
            $username = $request->input('username');
            // Utilizamos like para permitir búsquedas parciales
            $query->where('username', 'like', '%' . $username . '%');
        }

        if ($request->filled('email')) {
            $email = $request->input('email');
            // Búsqueda exacta o parcial según necesites
            $query->where('email', 'like', '%' . $email . '%');
        }

        if ($request->filled('estado')) {
            $estado = $request->input('estado');
            $query->where('estado', 'like', '%' . $estado . '%');
        }

        if ($request->filled('password')) {
            $password = $request->input('password');
            // Advertencia: este filtro puede no funcionar correctamente si la contraseña está hasheada.
            $query->where('password', 'like', '%' . $password . '%');
        }

        if ($request->filled('nombreCompleto')) {
            $nombreCompleto = $request->input('nombreCompleto');
            $query->where('nombreCompleto', 'like', '%' . $nombreCompleto . '%');
        }

        // Si es necesario, incluir relaciones definidas en el modelo
        $query->with(['roles', 'usuarioPerfil']);

        // Se recomienda paginar los resultados para no sobrecargar la respuesta
        $usuarios = $query->paginate(10);

        return response()->json([
            'status' => 'success',
            'data'   => $usuarios
        ]);
    }
}
