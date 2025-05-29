<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rol', function (Blueprint $table) {
            $table->increments('idRol');
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
            $table->text('permisos')->nullable();
            $table->timestamps();
        });

        DB::table('rol')->insert([
            [
                'idRol'       => 1,
                'nombre'      => 'master',
                'descripcion' => 'master',
                'permisos'    => json_encode(['users_read' => true]),
                'created_at'  => Carbon::parse('2025-04-24 22:22:55'),
                'updated_at'  => Carbon::parse('2025-04-24 22:22:55'),
            ],
            [
                'idRol'       => 2,
                'nombre'      => 'Administrador del Sistema',
                'descripcion' => 'Gestiona usuarios, roles y configuraciones globales.',
                'permisos'    => json_encode([
                    'profiles_manage'                 => true,
                    'region_management_manage'        => true,
                    'cities_management_manage'        => true,
                    'country_management_manage'       => true,
                    'entities_manage'                 => true,
                    'professionals_management_manage' => true,
                    'programs_management_manage'      => true,
                    'slots_management_manage'         => true,
                    'processes_management_manage'     => true,
                    'classroom_management_manage'     => true,
                    'timetable_management_manage'     => true,
                    'classes_management_manage'       => true,
                    'courses_management_manage'       => true,
                    'roles_manage'                    => true,
                    'branches_manage'                 => true,
                    'batches_management_manage'       => true,
                    'location_management_manage'      => true,
                    'area_management_manage'          => true,
                    'users_edit'                      => false,
                ]),
                'created_at'  => Carbon::parse('2025-04-25 03:57:01'),
                'updated_at'  => Carbon::parse('2025-05-02 14:53:15'),
            ],
            [
                'idRol'       => 3,
                'nombre'      => 'Gestor Académico',
                'descripcion' => 'Administra programas académicos y asignaturas.',
                'permisos'    => json_encode([
                    'branches_manage'               => true,
                    'batches_management_manage'     => true,
                ]),
                'created_at'  => Carbon::parse('2025-04-25 03:57:01'),
                'updated_at'  => Carbon::parse('2025-04-25 05:18:38'),
            ],
            [
                'idRol'       => 5,
                'nombre'      => 'Profesor',
                'descripcion' => 'Imparte clases y evalúa el rendimiento estudiantil.',
                'permisos'    => json_encode(['roles_manage' => true]),
                'created_at'  => Carbon::parse('2025-04-25 03:57:09'),
                'updated_at'  => Carbon::parse('2025-04-25 05:18:57'),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Rol');
    }
};
