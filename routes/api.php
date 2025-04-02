<?php

use App\Http\Controllers\Api\UsuarioController;
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
Route::post('register', [UsuarioController::class, 'store']);
Route::middleware('auth:sanctum')->group(function () {
    Route::put('user/{id}', [UsuarioController::class, 'update']);
    Route::delete('user/{id}', [UsuarioController::class, 'destroy']);
    Route::post('logout', [UsuarioController::class, 'closeSession']);
});
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
