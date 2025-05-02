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
        Schema::table('horario', function (Blueprint $table) {
            // Primero, soltar la FK y la columna idFranjaHoraria
            $table->dropForeign(['idFranjaHoraria']);
            $table->dropColumn('idFranjaHoraria');

            // Añadir las nuevas columnas de hora de inicio y fin
            $table->time('hora_inicio')->after('idAula');
            $table->time('hora_fin')->after('hora_inicio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('horario', function (Blueprint $table) {
            // Eliminar las columnas de hora de inicio y fin
            $table->dropColumn(['hora_inicio', 'hora_fin']);

            // Volver a añadir idFranjaHoraria y su FK
            $table->unsignedInteger('idFranjaHoraria')->nullable()->after('idAula');
            $table->foreign('idFranjaHoraria')
                  ->references('idFranjaHoraria')->on('franja_horaria')
                  ->onDelete('set null');
        });
    }
};
