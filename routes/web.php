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

Route::get('locationManagement/citiesManagement', function () {
    return Inertia::render('CityManagement/CityManagement');
})->middleware(['auth', 'verified'])->name('citiesManagement');

Route::get('/batchManagement', function () {
    return Inertia::rener('BatchManagement/BatchManagement');
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

Route::get('specialtyProfessional/professionals', function () {
    return Inertia::render('SpacialityAndProfessionals/PrincipalProfessonals');
})->middleware(['auth', 'verified'])->name('PrincipalProfessonals');

Route::get('specialtyProfessional/area', function () {
    return Inertia::render('SpacialityAndProfessionals/PrincipalSpacialyty');
})->middleware(['auth', 'verified'])->name('PrincipalSpacialyty');

Route::get('processManagement', function () {
    return Inertia::render('ProccessManagement/ProccessManagement');
})->middleware(['auth', 'verified'])->name('ProccessManagement');

Route::get('course', function () {
    return Inertia::render('CourseManagement/CourseManagement');
})->middleware(['auth', 'verified'])->name('CourseManagement');

Route::get('locationManagement/regionManagement', function () {
    return Inertia::render('RegionManagement/RegionManagement');
})->middleware(['auth', 'verified'])->name('RegionManagement');

Route::get('locationManagement/countriesManagement', function () {
    return Inertia::render('CountryManagement/CountryManagement');
})->middleware(['auth', 'verified'])->name('CountryManagement');

Route::get('/scheduleTimer', function () {
    return Inertia::render('SheduleManagement/SheduleManagement');
})->middleware(['auth', 'verified'])->name('scheduleTimer');

Route::get('/slotManagement', function () {
    return Inertia::render('SlotManagement/SlotManagement');
})->middleware(['auth', 'verified'])->name('slotManagement');

Route::get('/classroomManagement', function () {
    return Inertia::render('ClassroomManagement/ClassroomManagement');
})->middleware(['auth', 'verified'])->name('ClassroomManagement');

Route::get('/classManagement', function () {
    return Inertia::render('ClassManagement/ClassManagement');
})->middleware(['auth', 'verified'])->name('ClassManagement');

Route::get('/locationManagement', function () {
    return Inertia::render('LocationManagement/LocationManagement');
})->middleware(['auth', 'verified'])->name('LocationManagement');

Route::get('locationManagement/department', function () {
    return Inertia::render('DepartamentManagement/DeparmentManagement');
})->middleware(['auth', 'verified'])->name('DepartamentManagement');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
