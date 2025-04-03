<?php

use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VariablesEntornoController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('login', [UsuarioController::class, 'login']);
Route::post('register',[UsuarioController::class,'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('user',UsuarioController::class);
    
    // Si tienes rutas adicionales que quieras proteger, como por ejemplo:
    Route::get('users/{user}/permisos', [UsuarioController::class, 'permisos']);
});
