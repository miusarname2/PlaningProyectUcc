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
        Schema::create('horario', function (Blueprint $table) {
            $table->increments('idHorario');
            $table->unsignedInteger('idCurso');
            $table->unsignedInteger('idProfesional');
            $table->unsignedInteger('idAula')->nullable();
            $table->unsignedInteger('idFranjaHoraria')->nullable();
            $table->enum('dia', ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
            $table->timestamps();
        
            // FK a curso
            $table->foreign('idCurso')
                  ->references('idCurso')->on('curso')
                  ->onDelete('cascade');
        
            // FK a profesional
            $table->foreign('idProfesional')
                  ->references('idProfesional')->on('profesional')
                  ->onDelete('cascade');
        
            // FK a aula, con SET NULL al borrar el aula
            $table->foreign('idAula')
                  ->references('idAula')->on('aula')
                  ->onDelete('set null');
        
            // FK a franja_horaria, con SET NULL al borrar la franja
            $table->foreign('idFranjaHoraria')
                  ->references('idFranjaHoraria')->on('franja_horaria')
                  ->onDelete('set null');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horario');
    }
};
