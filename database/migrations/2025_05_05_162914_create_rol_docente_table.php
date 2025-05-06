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
        Schema::create('rolDocente', function (Blueprint $table) {
            $table->increments('idRolDocente');
            $table->string('codigo', 20)->unique();
            $table->string('nombre', 50);
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        DB::table('rolDocente')->insert([
            ['codigo' => 'RD001', 'nombre' => 'Ejecutor', 'descripcion' => 'Responsable de ejecutar las tareas.', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'RD002', 'nombre' => 'Mentor',   'descripcion' => 'Guía y acompaña a otros profesionales.', 'created_at' => now(), 'updated_at' => now()],
            ['codigo' => 'RD003', 'nombre' => 'Tutor',    'descripcion' => 'Apoya y supervisa procesos de formación.', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rolDocente');
    }
};
