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
        Schema::table('lote', function (Blueprint $table) {
            if (Schema::hasColumn('lote', 'idPrograma')) {
                $table->dropForeign(['idPrograma']);
                $table->dropColumn('idPrograma');
            }
            $table->unsignedInteger('idCiudad')->nullable()->after('codigo');
            $table->foreign('idCiudad')
                ->references('idCiudad')
                ->on('ciudad')
                ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lote', function (Blueprint $table) {
            if (Schema::hasColumn('lote', 'idCiudad')) {
                $table->dropForeign(['idCiudad']);
                $table->dropColumn('idCiudad');
            }
            $table->unsignedInteger('idPrograma')->nullable()->after('codigo');
            $table->foreign('idPrograma')
                ->references('idPrograma')
                ->on('programa')
                ->onDelete('set null');
        });
    }
};
