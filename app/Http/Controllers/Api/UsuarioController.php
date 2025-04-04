<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
            $usuarios = Usuario::with('roles')->get();
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
                'nombreCompleto'=>'required|string|max:60',
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
            'nombreCompleto' =>'sometimes|required|string|max:60',
            'email'          => "sometimes|required|email|max:100|unique:usuarios,email,{$usuario->id_usuario},idUsuario",
            'estado'         => 'sometimes|required|in:Activo,Inactivo',
            'password'       => 'sometimes|required|string|min:6'
        ];

        $validatedData = $request->validate($rules);

        if(isset($validatedData['password'])) {
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
        
        // Buscar el usuario por email
        $usuario = Usuario::where('email', $credentials['email'])->first();

        // Verificar que el usuario exista y que la contraseña sea correcta
        if (!$usuario || !Hash::check($credentials['password'], $usuario->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Las credenciales proporcionadas son incorrectas.',
                'errors' => [
                    'email' => ['Verifica tu correo y contraseña e intenta nuevamente.']
                ]
            ], 401);
        }        

        // Actualizar el último acceso
        $usuario->ultimoAcceso = now();
        $usuario->save();

        $token = $usuario->createToken('auth_token')->plainTextToken;

        // Aquí podrías generar y devolver un token de autenticación (ej. JWT o Sanctum)
        // En este ejemplo retornamos el usuario autenticado junto con sus roles
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
}
