<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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

            $table->foreign('idPerfil')->references('idPerfil')->on('perfil')->onDelete('cascade');
            $table->foreign('idRol')->references('idRol')->on('rol')->onDelete('cascade');
        });

        DB::table('perfil_rol')->insert([
            ['idPerfil' => 1, 'idRol' => 2],
            ['idPerfil' => 2, 'idRol' => 3],
            ['idPerfil' => 3, 'idRol' => 5],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('perfil_rol');
    }
};
