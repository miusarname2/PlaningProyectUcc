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
        Schema::create('sede', function (Blueprint $table) {
            $table->increments('idSede');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->enum('tipo', ['Virtual', 'Física']);
            $table->string('acceso', 255)->nullable();
            $table->unsignedInteger('idCiudad')->nullable();
            $table->unsignedInteger('idEntidadPropietaria');
            $table->foreign('idCiudad')->references('idCiudad')->on('ciudad')->onDelete('set null');
            $table->foreign('idEntidadPropietaria')->references('idEntidad')->on('entidad')->onDelete('restrict')->onUpdate('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sede');
    }
};
