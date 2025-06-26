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
        if (! Schema::hasTable('lote_profesional')) {
            Schema::create('lote_profesional', function (Blueprint $table) {
                $table->unsignedInteger('idLote');
                $table->unsignedInteger('idProfesional');
                $table->primary(['idLote', 'idProfesional']);

                $table->foreign('idLote')
                    ->references('idLote')->on('lote')
                    ->onDelete('cascade');

                $table->foreign('idProfesional')
                    ->references('idProfesional')->on('profesional')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('lote_profesional')) {
            Schema::dropIfExists('lote_profesional');
        }
    }
};
