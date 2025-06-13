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
            // 1) Quitamos creditos si aún existe
            if (Schema::hasColumn('curso', 'creditos')) {
                $table->dropColumn('creditos');
            }

            // 2) Añadimos idLote nullable, sin FK, sin unique
            $table->unsignedInteger('idLote')->nullable()->after('horas');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('curso', function (Blueprint $table) {
            $table->dropColumn('idLote');
            $table->integer('creditos')->unsigned()->after('cohorte');
        });
    }
};
