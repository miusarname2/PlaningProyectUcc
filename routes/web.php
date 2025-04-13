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

Route::get('/citiesManagement', function () {
    return Inertia::render('CityManagement/CityManagement');
})->middleware(['auth', 'verified'])->name('citiesManagement');

Route::get('/dailyManagement', function () {
    return Inertia::render('DailyManagement/DailyManagement');
})->middleware(['auth', 'verified'])->name('dailyManagement');

Route::get('/batchManagement', function () {
    return Inertia::render('BatchManagement/BatchManagement');
})->middleware(['auth', 'verified'])->name('batchManagement');

Route::get('/programmeManagement', function () {
    return Inertia::render('ProgrammeManagement/ProgrammeManagement');
})->middleware(['auth', 'verified'])->name('programmeManagement');


Route::get('/sitesAndEntities', function () {
    return Inertia::render('SitesAndEntities/SitesAndEntities');
})->middleware(['auth', 'verified'])->name('sitesAndEntities');

Route::get('sitesAndEntities/sities', function () {
    return Inertia::render('SitesAndEntities/PrincipalSities');
})->middleware(['auth', 'verified'])->name('PrincipalSities');

Route::get('sitesAndEntities/entities', function () {
    return Inertia::render('SitesAndEntities/PrincipalEntitie');
})->middleware(['auth', 'verified'])->name('PrincipalEntities');

Route::get('specialtyProfessional', function () {
    return Inertia::render('SpacialityAndProfessionals/SpacialityAndProfessionals');
})->middleware(['auth', 'verified'])->name('spacialityAndProfessionals');

Route::get('specialtyProfessional/spaciality', function () {
    return Inertia::render('SpacialityAndProfessionals/PrincipalSpacialyty');
})->middleware(['auth', 'verified'])->name('PrincipalSpacialyty');

Route::get('specialtyProfessional/professionals', function () {
    return Inertia::render('SpacialityAndProfessionals/PrincipalProfessonals');
})->middleware(['auth', 'verified'])->name('PrincipalProfessonals');

Route::get('processManagement', function () {
    return Inertia::render('ProccessManagement/ProccessManagement');
})->middleware(['auth', 'verified'])->name('ProccessManagement');

Route::get('course', function () {
    return Inertia::render('CourseManagement/CourseManagement');
})->middleware(['auth', 'verified'])->name('CourseManagement');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
