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
        Schema::table('profesional', function (Blueprint $table) {
            // Nuevos campos
            $table->string('contrato', 255)->nullable()->after('perfil');
            $table->integer('numeroContratos')->unsigned()->nullable()->after('contrato');
            $table->string('disponibilidad', 100)->nullable()->after('numeroContratos');

            // Relación con ciudad
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
        Schema::table('profesional', function (Blueprint $table) {
            $table->dropForeign(['idCiudad']);
            $table->dropColumn(['contrato', 'numeroContratos', 'disponibilidad', 'idCiudad']);
        });

        Schema::dropIfExists('lote_profesional');
    }
};
