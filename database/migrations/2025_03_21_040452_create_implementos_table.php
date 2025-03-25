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
        Schema::create('Implemento', function (Blueprint $table) {
            $table->increments('idImplemento');
            $table->string('nombre', 100)->unique();
            $table->unsignedInteger('idAula');
            $table->timestamps();

            $table->foreign('idAula')
            ->references('idAula')->on('Aula')
            ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('Implemento');
    }
};
