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
        Schema::create('profesional_rol', function (Blueprint $table) {
            $table->unsignedInteger('idProfesional');
            $table->unsignedInteger('idRolDocente');

            $table->primary(['idProfesional', 'idRolDocente']);

            $table->foreign('idProfesional')
                  ->references('idProfesional')
                  ->on('profesional')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');

            $table->foreign('idRolDocente')
                  ->references('idRolDocente')
                  ->on('rolDocente')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profesional_rol', function (Blueprint $table) {
            $table->dropForeign(['idProfesional']);
            $table->dropForeign(['idRolDocente']);
        });
        Schema::dropIfExists('profesional_rol');
    }
};
