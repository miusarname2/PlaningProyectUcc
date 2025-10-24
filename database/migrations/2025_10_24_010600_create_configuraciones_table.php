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
        Schema::create('configuraciones', function (Blueprint $table) {
            $table->id();
            $table->string('clave')->unique();
            $table->text('valor')->nullable();
            $table->string('descripcion')->nullable();
            $table->timestamps();
        });

        // Insertar configuración inicial para login_enabled
        DB::table('configuraciones')->insert([
            'clave' => 'login_enabled',
            'valor' => 'false', // Inicialmente deshabilitado
            'descripcion' => 'Habilita o deshabilita el login manual. Si está deshabilitado, se usa autenticación automática con usuario ID 1',
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
