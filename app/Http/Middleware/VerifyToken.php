<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;

class VerifyToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1) Extraer el token del header Authorization
        $token = $request->bearerToken();
        if (! $token) {
            return response()->json([
                'error' => 'Token no proporcionado'
            ], 401);
        }

        // 2) Buscar el token en la tabla personal_access_tokens
        $accessToken = PersonalAccessToken::findToken($token);
        if (! $accessToken) {
            return response()->json([
                'error' => 'Token inválido o expirado'
            ], 401);
        }

        // 3) Resolver el usuario asociado al token
        $user = $accessToken->tokenable;
        $request->setUserResolver(fn() => $user);

        // 4) Continuar con la petición (equivalente a auth:sanctum)
        return $next($request);
    }
}
