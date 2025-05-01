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
        Schema::create('estado', function (Blueprint $table) {
            $table->increments('idEstado');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('idRegion');
            $table->timestamps();


            $table->foreign('idRegion')
                ->references('idRegion')
                ->on('region')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estado');
    }
};
