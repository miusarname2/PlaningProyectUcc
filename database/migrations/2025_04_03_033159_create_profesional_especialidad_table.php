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
        Schema::create('profesional_especialidad', function (Blueprint $table) {
            $table->unsignedInteger('idProfesional');
            $table->unsignedInteger('idEspecialidad');
            $table->primary(['idProfesional', 'idEspecialidad']);

            $table->foreign('idProfesional')
                  ->references('idProfesional')
                  ->on('profesional')
                  ->onDelete('cascade');

            $table->foreign('idEspecialidad')
                  ->references('idEspecialidad')
                  ->on('especialidad')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesional_especialidad');
    }
};
