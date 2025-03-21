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
        Schema::create('Usuarios_Grupos', function (Blueprint $table) {
            $table->unsignedInteger('idUsuario');
            $table->unsignedInteger('idGrupo');

            // Definir la llave primaria compuesta
            $table->primary(['idUsuario', 'idGrupo']);

            // Claves foráneas
            $table->foreign('idUsuario')->references('idUsuario')->on('Usuarios')->onDelete('cascade');
            $table->foreign('idGrupo')->references('idGrupo')->on('Grupos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Usuarios_Grupos');
    }
};
