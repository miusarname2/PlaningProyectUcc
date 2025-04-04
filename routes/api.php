<?php

use App\Http\Controllers\Api\CiudadController;
use App\Http\Controllers\Api\DepartamentoController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VariablesEntornoController;
use App\Models\Departamento;
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

Route::post('/login', [UsuarioController::class, 'login'])->middleware('web');
Route::post('register',[UsuarioController::class,'store']);
Route::resource('ciudad', CiudadController::class);
Route::resource('departamento', DepartamentoController::class);
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('user',UsuarioController::class);
    
    // Si tienes rutas adicionales que quieras proteger, como por ejemplo:
    Route::get('users/{user}/permisos', [UsuarioController::class, 'permisos']);
});
