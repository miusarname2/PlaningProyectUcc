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
        Schema::create('horario_dia', function (Blueprint $table) {
            $table->unsignedInteger('idHorario');
            $table->unsignedInteger('idDia');
            $table->time('hora_inicio');
            $table->time('hora_fin');

            $table->primary(['idHorario', 'idDia']);

            $table->foreign('idHorario')
                  ->references('idHorario')->on('horario')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');

            $table->foreign('idDia')
                  ->references('idDia')->on('dia')
                  ->onDelete('cascade')
                  ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('horario_dia', function (Blueprint $table) {
            $table->dropForeign(['idHorario']);
            $table->dropForeign(['idDia']);
        });
        Schema::dropIfExists('horario_dia');
    }
};
