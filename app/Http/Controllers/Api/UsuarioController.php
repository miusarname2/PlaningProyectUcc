<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UsuarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $usuarios = Usuario::with('roles')->get();
        return response()->json($usuarios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'nombre_usuario' => 'required|string|max:50',
            'email'          => 'required|email|max:100|unique:usuarios,email',
            'password'       => 'required|string|min:6', // campo password
            'estado'         => 'required|in:Activo,Inactivo',
            // Si deseas agregar ultimo_acceso, se puede enviar o asignar null
        ]);

        // Hashea la contraseña antes de guardarla
        $validatedData['password'] = Hash::make($validatedData['password']);

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
            'nombre_usuario' => 'sometimes|required|string|max:50',
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
            // Puedes optar por arrojar una excepción de validación
            throw ValidationException::withMessages([
                'message' => ['Las credenciales son incorrectas.'],
            ]);
        }

        // Actualizar el último acceso
        $usuario->ultimo_acceso = now();
        $usuario->save();

        // Aquí podrías generar y devolver un token de autenticación (ej. JWT o Sanctum)
        // En este ejemplo retornamos el usuario autenticado junto con sus roles
        return response()->json([
            'message' => 'Login exitoso',
            'usuario' => $usuario->load('roles')
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
