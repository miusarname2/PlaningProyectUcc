<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/usersRole', function () {
    return Inertia::render('UsersRoleManagement/UsersRoleManagement');
})->middleware(['auth', 'verified'])->name('usersRole');

Route::get('/usersRole/users', function () {
    return Inertia::render('UsersRoleManagement/UsersManagement');
})->middleware(['auth', 'verified'])->name('users');

Route::get('/usersRole/roles', function () {
    return Inertia::render('UsersRoleManagement/RoleManagement');
})->middleware(['auth', 'verified'])->name('roles');

Route::get('/usersRole/profile', function () {
    return Inertia::render('UsersRoleManagement/ProfileManagement');
})->middleware(['auth', 'verified'])->name('profile');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
