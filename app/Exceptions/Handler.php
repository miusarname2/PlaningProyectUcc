<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Throwable;
use Inertia\Inertia;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    // public function unauthenticated($request, AuthenticationException $exception)
    // {
    //     return response()->json([
    //         'error' => 'No autenticado',
    //         'message' => 'Debes iniciar sesión para acceder a esta ruta.'
    //     ], 401);
    // }
    public function unauthenticated($request, AuthenticationException $exception)
{
    if ($request->expectsJson()) {
        // Si es una petición Inertia (espera JSON), redirige con Inertia
        return Inertia::location(route('login'));
    }

    // Si no es petición JSON, redirige normalmente
    return redirect()->guest(route('login'));
}
}
