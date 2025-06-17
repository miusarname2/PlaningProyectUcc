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
            $table->string('tipo', 50)->nullable()->after('estado');
            $table->string('numero', 50)->nullable()->after('tipo');
            $table->string('convenio', 100)->nullable()->after('numero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('curso', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'numero', 'convenio']);
        });
    }
};
