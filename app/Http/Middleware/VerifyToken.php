<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1) Obtener el header Authorization
        $authHeader = $request->header('Authorization');

        if (!$authHeader) {
            return response()->json([
                'error' => 'Token no proporcionado'
            ], 401);
        }

        // 2) Esperamos formato "Bearer {token}"
        if (!preg_match('/Bearer\s+(.+)/', $authHeader, $matches)) {
            return response()->json([
                'error' => 'Formato de token inválido'
            ], 401);
        }

        $token = $matches[1];

        // 3) Validar el token (aquí debes poner tu lógica, por ejemplo:)
        if (! $this->isValidToken($token)) {
            return response()->json([
                'error' => 'Token inválido o expirado'
            ], 401);
        }

        // 4) Continuar con la petición
        return $next($request);
    }

    protected function isValidToken(string $token): bool
    {
        // Ejemplo muy básico: buscar en una tabla 'api_tokens'
        return \DB::table('api_tokens')
            ->where('token', $token)
            ->where('expires_at', '>', now())
            ->exists();
    }
}
