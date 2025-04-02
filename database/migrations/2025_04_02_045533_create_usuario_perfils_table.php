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
        Schema::create('usuario_perfil', function (Blueprint $table) {
            $table->unsignedInteger('idUsuario')->primary();
            $table->unsignedInteger('idPerfil')->primary();

            $table->foreign('idUsuario')->references('idUsuario')->on('Usuario')->onDelete('cascade');
            $table->foreign('idPerfil')->references('idPerfil')->on('Perfil')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_perfil');
    }
};
