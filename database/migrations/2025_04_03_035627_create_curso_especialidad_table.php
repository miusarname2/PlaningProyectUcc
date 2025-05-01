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
        Schema::create('curso_especialidad', function (Blueprint $table) {
            $table->unsignedInteger('idCurso');
            $table->unsignedInteger('idEspecialidad');
            $table->primary(['idCurso', 'idEspecialidad']);

            $table->foreign('idCurso')
                  ->references('idCurso')->on('curso')
                  ->onDelete('cascade');

            $table->foreign('idEspecialidad')
                  ->references('idEspecialidad')->on('especialidad')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curso_especialidad');
    }
};
