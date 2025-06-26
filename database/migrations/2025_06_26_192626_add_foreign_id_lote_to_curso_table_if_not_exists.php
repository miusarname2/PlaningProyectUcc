<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    protected string $tableName = 'curso';
    protected string $foreignName = 'curso_idLote_foreign';

    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Si no existe la tabla, no hacemos nada
        if (! Schema::hasTable($this->tableName)) {
            return;
        }

        // ¿Ya existe la FK en information_schema?
        $exists = DB::selectOne(
            "SELECT COUNT(*) AS cnt
             FROM information_schema.TABLE_CONSTRAINTS
             WHERE CONSTRAINT_SCHEMA = ?
               AND TABLE_NAME       = ?
               AND CONSTRAINT_NAME  = ?
               AND CONSTRAINT_TYPE  = 'FOREIGN KEY'",
            [
                DB::getDatabaseName(),
                $this->tableName,
                $this->foreignName,
            ]
        );

        if ($exists->cnt === 0) {
            // Si no existía, la creamos
            Schema::table($this->tableName, function (Blueprint $table) {
                $table
                    ->foreign('idLote', $this->foreignName)
                    ->references('idLote')
                    ->on('lote')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (! Schema::hasTable($this->tableName)) {
            return;
        }

        // Al borrar no hace falta consultar: Laravel ignora dropForeign si no existe
        Schema::table($this->tableName, function (Blueprint $table) {
            $table->dropForeign($this->foreignName);
        });
    }
};
