<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateSedeAddPropietario extends Migration
{
    public function up(): void
    {
        Schema::table('sede', function (Blueprint $table) {
            $table->unsignedInteger('idEntidadPropietaria')->after('idCiudad');
            $table->foreign('idEntidadPropietaria')
                  ->references('idEntidad')->on('entidad')
                  ->onDelete('restrict')
                  ->onUpdate('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('sede', function (Blueprint $table) {
            $table->dropForeign(['idEntidadPropietaria']);
            $table->dropColumn('idEntidadPropietaria');
        });
    }
}