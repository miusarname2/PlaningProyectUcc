<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
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
        // 1) Extraer token Bearer
        $token = $request->bearerToken();
        if (! $token) {
            return response()->json(['error' => 'Token no proporcionado'], 401);
        }

        // 2) Validar en personal_access_tokens
        $accessToken = PersonalAccessToken::findToken($token);
        if (! $accessToken) {
            return response()->json(['error' => 'Token inválido o expirado'], 401);
        }

        // 3) Resolver usuario asociado
        $user = $accessToken->tokenable;
        $request->setUserResolver(fn() => $user);

        // 4) Continuar con la petición
        return $next($request);
    }
}
