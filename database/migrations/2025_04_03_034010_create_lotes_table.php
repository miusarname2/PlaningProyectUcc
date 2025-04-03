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
        Schema::create('lote', function (Blueprint $table) {
            $table->increments('idLote');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->unsignedInteger('idPrograma')->nullable();
            $table->date('fechaInicio');
            $table->date('fechaFin');
            $table->integer('numEstudiantes')->unsigned();
            $table->enum('estado', ['Activo', 'Inactivo']);
            $table->timestamps();

            $table->foreign('idPrograma')
                ->references('idPrograma')->on('programa')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lote');
    }
};
