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
        Schema::create('programa', function (Blueprint $table) {
            $table->increments('idPrograma');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->integer('duracion')->unsigned(); // Se asegura que sea mayor a 0, validarlo en la aplicación
            $table->unsignedInteger('idEspecialidad')->nullable();
            $table->enum('estado', ['Activo', 'Inactivo']);
            $table->timestamps();

            $table->foreign('idEspecialidad')
                ->references('idEspecialidad')
                ->on('especialidad')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('programa');
    }
};
