<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    protected $tableName = 'sede';

    protected $foreignKeyName = 'sede_idEntidadPropietaria_foreign';

    /**
     * Run the migrations.
     */
    public function up()
    {
        // 1) Hago que Doctrine entienda los ENUM como string
        $platform = DB::getDoctrineConnection()->getDatabasePlatform();
        $platform->registerDoctrineTypeMapping('enum', 'string');

        // 2) Continúo con el chequeo de la FK...
        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $table = $sm->listTableDetails($this->tableName);

        if (! $table->hasForeignKey($this->foreignKeyName)) {
            Schema::table($this->tableName, function (Blueprint $table) {
                if (! Schema::hasColumn($this->tableName, 'idEntidadPropietaria')) {
                    $table->unsignedInteger('idEntidadPropietaria')->after('idCiudad');
                }
                $table->foreign('idEntidadPropietaria', $this->foreignKeyName)
                      ->references('idEntidad')
                      ->on('entidad')
                      ->onDelete('restrict')
                      ->onUpdate('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // También registramos antes de inspeccionar
        $platform = DB::getDoctrineConnection()->getDatabasePlatform();
        $platform->registerDoctrineTypeMapping('enum', 'string');

        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $table = $sm->listTableDetails($this->tableName);

        if ($table->hasForeignKey($this->foreignKeyName)) {
            Schema::table($this->tableName, function (Blueprint $table) {
                $table->dropForeign($this->foreignKeyName);
            });
        }
    }
};
