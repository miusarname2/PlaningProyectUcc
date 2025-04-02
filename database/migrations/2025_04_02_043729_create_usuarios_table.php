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
        Schema::create('Usuario', function (Blueprint $table) {
            $table->increments('idUsuario');
            $table->string('username',50);
            $table->string('email',100)->unique();
            $table->enum('estado', ['Activo','Inactivo']);
            $table->dateTime('ultimoAcceso');
            $table->string('nombreCompleto',100);
            $table->string('password');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Usuario');
    }
};
