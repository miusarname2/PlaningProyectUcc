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
        Schema::create('aula', function (Blueprint $table) {
            $table->increments('idAula');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('idSede');
            $table->unsignedInteger('capacidad')->nullable();
            $table->enum('estado', ['Disponible', 'No Disponible'])->default('Disponible');
            $table->timestamps();

            $table->foreign('idSede')
                  ->references('idSede')
                  ->on('sede')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aula');
    }
};
