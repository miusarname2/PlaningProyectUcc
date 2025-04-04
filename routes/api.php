<?php

use App\Http\Controllers\Api\CiudadController;
use App\Http\Controllers\Api\CursoController;
use App\Http\Controllers\Api\DepartamentoController;
use App\Http\Controllers\Api\EntidadController;
use App\Http\Controllers\Api\EspecialidadController;
use App\Http\Controllers\Api\FranjaHorariaController;
use App\Http\Controllers\Api\HorarioController;
use App\Http\Controllers\Api\LoteController;
use App\Http\Controllers\Api\PaisController;
use App\Http\Controllers\Api\PerfilController;
use App\Http\Controllers\Api\ProfesionalController;
use App\Http\Controllers\Api\ProgramaController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\SedeController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\UsuarioPerfilController;
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

Route::post('/login', [UsuarioController::class, 'login']);
Route::post('register', [UsuarioController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::resource('user', UsuarioController::class);
    Route::resource('ciudad', CiudadController::class);
    Route::resource('curso', CursoController::class);
    Route::resource('departamento', DepartamentoController::class);
    Route::resource('entidad', EntidadController::class);
    Route::resource('especialidad', EspecialidadController::class);
    Route::resource('franjaHoraria', FranjaHorariaController::class);
    Route::resource('Horario', HorarioController::class);
    Route::resource('lote', LoteController::class);
    Route::resource('pais', PaisController::class);
    Route::resource('perfil', PerfilController::class);
    Route::resource('profesional', ProfesionalController::class);
    Route::resource('programa', ProgramaController::class);
    Route::resource('region', RegionController::class);
    Route::resource('rol', RolController::class);
    Route::resource('sede', SedeController::class);
    Route::resource('usuarioPerfil', UsuarioPerfilController::class);
    Route::resource('VariableEntorno', VariablesEntornoController::class);

    // Si tienes rutas adicionales que quieras proteger, como por ejemplo:
    Route::get('users/{user}/permisos', [UsuarioController::class, 'permisos']);
});
