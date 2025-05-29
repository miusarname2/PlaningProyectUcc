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
        Schema::create('perfil', function (Blueprint $table) {
            $table->increments('idPerfil');
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        DB::table('perfil')->insert([
            [
                'nombre'       => 'Administrador General',
                'descripcion'  => 'Perfil con todos los permisos administrativos.',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ],
            [
                'nombre'       => 'Gestor Académico',
                'descripcion'  => 'Perfil encargado de la gestión de programas académicos.',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ],
            [
                'nombre'       => 'Profesor',
                'descripcion'  => 'Perfil para docentes que imparten clases y evalúan estudiantes.',
                'created_at'   => Carbon::now(),
                'updated_at'   => Carbon::now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Perfil');
    }
};
