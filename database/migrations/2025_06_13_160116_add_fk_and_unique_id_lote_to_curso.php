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
        Schema::table('curso', function (Blueprint $table) {
            // 2) Añadimos la clave foránea
            $table->foreign('idLote')
                ->references('idLote')->on('lote')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('curso', function (Blueprint $table) {
            $table->dropForeign(['idLote']);
            $table->dropUnique(['idLote']);
            $table->unsignedInteger('idLote')->nullable()->change();
        });
    }
};
