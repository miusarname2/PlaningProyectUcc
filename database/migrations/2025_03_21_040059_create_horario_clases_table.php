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
        Schema::create('Horarios_Clase', function (Blueprint $table) {
            $table->unsignedInteger('idClase');
            $table->unsignedInteger('idDia');
            $table->unsignedInteger('idHora');

            $table->primary(['idClase', 'idDia', 'idHora']);

            $table->foreign('idClase')
                ->references('idClase')->on('Clases')
                ->onDelete('cascade');

            $table->foreign('idDia')
                ->references('idDia')->on('Dias')
                ->onDelete('cascade');

            $table->foreign('idHora')
                ->references('idHora')->on('Horas')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Horarios_Clase');
    }
};
