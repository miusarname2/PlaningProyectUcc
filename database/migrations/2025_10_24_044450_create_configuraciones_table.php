<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id();
            $table->string('clave')->unique();
            $table->text('valor')->nullable();
            $table->string('tipo')->default('string'); // string, boolean, json
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        // Insertar configuración inicial para login habilitado/deshabilitado
        DB::table('configuraciones')->insert([
            'clave' => 'login_enabled',
            'valor' => 'false', // Por defecto deshabilitado
            'tipo' => 'boolean',
            'descripcion' => 'Controla si el login está habilitado o deshabilitado',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuraciones');
    }
};
