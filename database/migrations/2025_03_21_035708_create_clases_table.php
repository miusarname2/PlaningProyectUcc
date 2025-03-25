<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('Clase', function (Blueprint $table) {
            $table->increments('idClase');
            $table->unsignedInteger('idMateria');
            $table->unsignedInteger('idGrupo');
            $table->unsignedInteger('idUsuario');  // Docente encargado
            $table->unsignedInteger('idAula');
            $table->timestamps();

            $table->foreign('idMateria')->references('idMateria')->on('Materia')->onDelete('cascade');
            $table->foreign('idGrupo')->references('idGrupo')->on('Grupo')->onDelete('cascade');
            $table->foreign('idUsuario')->references('idUsuario')->on('Usuario')->onDelete('cascade');
            $table->foreign('idAula')->references('idAula')->on('Aula')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Clase');
    }
};
