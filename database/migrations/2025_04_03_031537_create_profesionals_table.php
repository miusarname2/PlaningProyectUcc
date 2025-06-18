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
            $table->string('email', 100)->unique()->nullable();
            $table->string('titulo', 100);
            $table->integer('experiencia')->unsigned(); // Se valida en la aplicación o con DB check
            $table->enum('estado', ['Activo', 'Inactivo']);
            $table->mediumText('perfil')->nullable();
            $table->string('contrato', 255)->nullable();
            $table->integer('numeroContratos')->unsigned()->nullable();
            $table->string('disponibilidad', 100)->nullable();
            $table->timestamps();

            $table->unsignedInteger('idCiudad')->nullable()->after('disponibilidad');
            $table->foreign('idCiudad')->references('idCiudad')->on('ciudad')->onDelete('set null');
        });

        Schema::create('lote_profesional', function (Blueprint $table) {
            $table->unsignedInteger('idLote');
            $table->unsignedInteger('idProfesional');

            $table->foreign('idLote')->references('idLote')->on('lote')->onDelete('cascade');
            $table->foreign('idProfesional')->references('idProfesional')->on('profesional')->onDelete('cascade');

            $table->primary(['idLote', 'idProfesional']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesional');
        Schema::dropIfExists('lote_profesional');
    }
};
