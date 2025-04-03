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
        Schema::create('horario', function (Blueprint $table) {
            $table->increments('idHorario');
            $table->unsignedInteger('idCurso');
            $table->unsignedInteger('idProfesional');
            // Los campos idAula e idFranjaHoraria se definen, 
            // aunque en este ejemplo no se especifican sus claves foráneas.
            $table->unsignedInteger('idAula')->nullable();
            $table->unsignedInteger('idFranjaHoraria')->nullable();
            $table->enum('dia', ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
            $table->timestamps();

            $table->foreign('idCurso')
                  ->references('idCurso')->on('curso')
                  ->onDelete('cascade');

            $table->foreign('idProfesional')
                  ->references('idProfesional')->on('profesional')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horario');
    }
};
