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
        Schema::create('Reserva', function (Blueprint $table) {
            $table->increments('idReserva');
            $table->unsignedInteger('idUsuario');
            $table->unsignedInteger('idImplemento');
            $table->date('fecha');
            $table->time('hora');
            $table->enum('estado', ['Pendiente', 'Aprobada', 'Rechazada'])->default('Pendiente');
            $table->timestamps();
            
            $table->foreign('idUsuario')
                ->references('idUsuario')->on('Usuario')
                ->onDelete('cascade');
            $table->foreign('idImplemento')
                ->references('idImplemento')->on('Implemento')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Reserva');
    }
};
