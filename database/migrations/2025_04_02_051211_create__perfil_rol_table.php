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
        Schema::create('perfil_rol', function (Blueprint $table) {
            $table->unsignedInteger('idPerfil');
            $table->unsignedInteger('idRol');

            $table->foreign('idPerfil')->references('idPerfil')->on('Perfil')->onDelete('cascade');
            $table->foreign('idRol')->references('idRol')->on('Rol')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfil_rol');
    }
};
