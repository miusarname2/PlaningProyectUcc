<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UsuarioController extends Controller
{

    public function index()
    {
        // Eager loading para cargar el rol de cada usuario y evitar consultas adicionales
        $usuarios = Usuario::with('rol')->get();
        return response()->json($usuarios, 200);
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validate = $request->validate([
            'nombre' => 'required|string|max:100',
            'password' => 'required|string|min:6',
            'idRol'    => 'required|integer|exists:Roles,idRol',
        ]);

        $usuario = Usuario::create([
            'nombre'   => $validate['nombre'],
            'password' => Hash::make($validate['password']),
            'idRol'    => $validate['idRol'],
        ]);

        return response()->json([
            'Message' => 'Usuario registrado correctamente',
            'User' => $usuario,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $usuario = Usuario::findOrFail($id);
        return response()->json($usuario);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $usuario = Usuario::findOrFail($id);

        $validate = $request->validate([
            'nombre'   => 'sometimes|required|string|max:100',
            'password' => 'sometimes|required|string|min:6',
            'idRol'    => 'sometimes|required|integer|exists:Roles,idRol',
        ]);

        if (isset($validate['password'])) {
            $validate['password'] = Hash::make($validate['password']);
        }

        $usuario->update($validate);

        return response()->json([
            'message' => 'Usuario actualizado correctamente',
            'usuario' => $usuario,
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $usuario = Usuario::findOrFail($id);

        $usuario->delete();

        return response()->json(['Message' => 'User successfully eliminated', 'status' => 200], 200);
    }

    public function login(Request $request)
    {
        $validate = $request->validate([
            'nombre'   => 'required|string|max:100',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('nombre', $validate['nombre'])->first();

        if (!$usuario || !Hash::check($validate['password'], $usuario->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        $token = $usuario->createToken('authToken')->plainTextToken;

        return response()->json([
            'message'      => 'Login exitoso',
            'usuario'      => $usuario,
            'access_token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente'], 200);
    }

    public function checkAuth(Request $request)
    {
        $usuario = $request->user();

        if ($usuario) {
            // Retornamos un mensaje indicando que el usuario está autenticado junto con el token (si lo deseas)
            // El token actual no se almacena en el modelo, pero puedes obtener el token enviado en el header con $request->bearerToken()
            return response()->json([
                'message' => 'Usuario autenticado',
                'access_token' => $request->bearerToken(),  // Token enviado en la petición
                'usuario' => $usuario
            ], 200);
        }

        return response()->json([
            'message' => 'Usuario no autenticado, por favor inicie sesión'
        ], 401);
    }
}
