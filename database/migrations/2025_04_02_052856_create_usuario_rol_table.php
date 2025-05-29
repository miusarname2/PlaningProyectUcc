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
        Schema::create('usuario_rol', function (Blueprint $table) {
            $table->unsignedInteger('idUsuario');
            $table->unsignedInteger('idRol');
            $table->primary(['idUsuario','idRol']);

            $table->foreign('idUsuario')->references('idUsuario')->on('usuario')->onDelete('cascade');
            $table->foreign('idRol')->references('idRol')->on('rol')->onDelete('cascade');
        });

        DB::table('usuario_rol')->insert([
            ['idUsuario' => 1, 'idRol' => 2],
            ['idUsuario' => 2, 'idRol' => 2],
            ['idUsuario' => 3, 'idRol' => 2],
            ['idUsuario' => 4, 'idRol' => 2],
            ['idUsuario' => 6, 'idRol' => 2],
            ['idUsuario' => 5, 'idRol' => 5],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario_rol');
    }
};
