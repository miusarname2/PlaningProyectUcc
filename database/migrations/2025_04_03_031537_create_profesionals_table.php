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
        Schema::create('profesional', function (Blueprint $table) {
            $table->increments('idProfesional');
            $table->string('codigo', 20)->unique();
            $table->string('identificacion', 20)->unique();
            $table->string('nombreCompleto', 200);
            $table->string('email', 100)->unique();
            $table->string('titulo', 100);
            $table->integer('experiencia')->unsigned(); // Se valida en la aplicación o con DB check
            $table->enum('estado', ['Activo', 'Inactivo']);
            $table->mediumText('perfil')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesional');
    }
};
