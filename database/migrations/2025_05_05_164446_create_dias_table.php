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
        Schema::create('dia', function (Blueprint $table) {
            $table->increments('idDia');
            $table->string('nombre', 20)->unique();
            $table->timestamps();
        });

        DB::table('dia')->insert([
            ['nombre' => 'Lunes'],
            ['nombre' => 'Martes'],
            ['nombre' => 'Miércoles'],
            ['nombre' => 'Jueves'],
            ['nombre' => 'Viernes'],
            ['nombre' => 'Sábado'],
            ['nombre' => 'Domingo'],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dias');
    }
};
