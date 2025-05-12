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
        Schema::create('curso', function (Blueprint $table) {
            $table->increments('idCurso');
            $table->string('codigo', 26)->unique();
            $table->string('codigoGrupo', 30)->nullable();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->enum('modalidad', ['Presencial', 'Virtual'])->nullable();
            $table->enum('nivel', ['Avanzado', 'Intermedio', 'Basico'])->nullable();
            $table->unsignedInteger('cohorte')->nullable();
            $table->integer('creditos')->unsigned();
            $table->integer('horas')->unsigned();
            $table->enum('estado', ['Activo', 'Inactivo']);
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('curso');
    }
};
