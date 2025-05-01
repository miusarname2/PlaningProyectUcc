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
        Schema::create('sede_prestamos', function (Blueprint $table) {
            $table->increments('idPrestamo');
            $table->unsignedInteger('idSede')->index();
            $table->unsignedInteger('idEntidadPrestamista')->index();
            $table->unsignedInteger('idEntidadPrestataria')->index();
            $table->date('fechaInicio');
            $table->date('fechaFin');
            $table->enum('estado', ['pendiente', 'activo', 'finalizado'])->default('Activo');
            $table->timestamps();

            $table->foreign('idSede')
                ->references('idSede')->on('sede')
                ->onDelete('cascade')
                ->onUpdate('cascade');

            $table->foreign('idEntidadPrestamista')
                ->references('idEntidad')->on('entidad')
                ->onDelete('restrict')
                ->onUpdate('cascade');

            $table->foreign('idEntidadPrestataria')
                ->references('idEntidad')->on('entidad')
                ->onDelete('restrict')
                ->onUpdate('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sede_prestamos');
    }
};
