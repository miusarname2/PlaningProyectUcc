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
        Schema::create('horario_profesional', function (Blueprint $table) {
            $table->unsignedInteger('idHorario');
            $table->unsignedInteger('idProfesional');
            $table->unsignedInteger('idRolDocente');      // Aquí guardamos el rol de ese docente en este horario
        
            // PK compuesta
            $table->primary(['idHorario', 'idProfesional']);
        
            // FKs
            $table->foreign('idHorario')
                  ->references('idHorario')->on('horario')
                  ->onDelete('cascade')->onUpdate('cascade');
        
            $table->foreign('idProfesional')
                  ->references('idProfesional')->on('profesional')
                  ->onDelete('cascade')->onUpdate('cascade');
        
            $table->foreign('idRolDocente')
                  ->references('idRolDocente')->on('rolDocente')
                  ->onDelete('restrict')->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
