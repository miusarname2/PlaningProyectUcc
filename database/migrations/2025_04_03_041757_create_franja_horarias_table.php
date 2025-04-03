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
        Schema::create('franja_horaria', function (Blueprint $table) {
            $table->increments('idFranjaHoraria');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 50);
            $table->time('horaInicio');
            $table->time('horaFin');
            $table->integer('duracionMinutos')->unsigned();
            $table->enum('tipo', ['Fin de semana', 'Regular', 'Break', 'Tarde', 'Tarde Noche']);
            $table->enum('estado', ['Activo', 'Inactivo']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('franja_horaria');
    }
};
