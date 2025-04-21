<?php

use App\Http\Controllers\Api\AulaController;
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
use App\Http\Controllers\Api\ProcesoController;
use App\Http\Controllers\Api\ProfesionalController;
use App\Http\Controllers\Api\ProgramaController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\RolController;
use App\Http\Controllers\Api\SedeController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\UsuarioPerfilController;
use App\Http\Controllers\Api\VariablesEntornoController;
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
Route::middleware(['auth:sanctum', 'throttle:search'])
    ->withoutMiddleware('throttle:api')
    ->group(function () {
        Route::get('user/search', [UsuarioController::class, 'search']);
        Route::get('ciudad/search', [CiudadController::class, 'search']);
        Route::get('curso/search', [CursoController::class, 'search']);
        Route::get('departamento/search', [DepartamentoController::class, 'search']);
        Route::get('entidad/search', [EntidadController::class, 'search']);
        Route::get('especialidad/search', [EspecialidadController::class, 'search']);
        Route::get('franjaHoraria/search', [FranjaHorariaController::class, 'search']);
        Route::get('Horario/search', [HorarioController::class, 'search']);
        Route::get('lote/search', [LoteController::class, 'search']);
        Route::get('pais/search', [PaisController::class, 'search']);
        Route::get('perfil/search', [PerfilController::class, 'search']);
        Route::get('profesional/search', [ProfesionalController::class, 'search']);
        Route::get('programa/search', [ProgramaController::class, 'search']);
        Route::get('region/search', [RegionController::class, 'search']);
        Route::get('rol/search', [RolController::class, 'search']);
        Route::get('sede/search', [SedeController::class, 'search']);
        Route::get('usuarioPerfil/search', [UsuarioPerfilController::class, 'search']);
        Route::get('aula/search', [AulaController::class, 'search']);
        Route::get('proceso/search', [ProcesoController::class, 'search']);
        Route::get('lote/search', [LoteController::class, 'search']);
    });
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user/{user}/permisos', [UsuarioController::class, 'permisos']);
    Route::get('horario/export-xlsx', [HorarioController::class, 'exportXls']);
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
    Route::resource('aula', AulaController::class);
    Route::resource('proceso', ProcesoController::class);
    Route::resource('usuarioPerfil',UsuarioPerfilController::class);
});
