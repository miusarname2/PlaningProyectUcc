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
        Schema::create('ciudad', function (Blueprint $table) {
            $table->increments('idCiudad');
            $table->string('nombre', 100);
            $table->string('codigoPostal', 10)->nullable();
            $table->unsignedInteger('idRegion');
            $table->unsignedInteger('idEstado');
            $table->timestamps();
            $table->foreign('idRegion')->references('idRegion')->on('region')->onDelete('cascade');
            $table->foreign('idEstado')->references('idEstado')->on('estado')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ciudad');
    }
};
