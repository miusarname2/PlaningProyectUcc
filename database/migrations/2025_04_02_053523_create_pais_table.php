<?php

use Carbon\Carbon;
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
        Schema::create('pais', function (Blueprint $table) {
            $table->increments('idPais');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->timestamps();
        });

        DB::table('pais')->insert([
            'idPais'      => 1,
            'nombre'      => 'Colombia',
            'descripcion' => 'La República de Colombia, país ubicado en el noroeste de América del Sur, con capital en Bogotá.',
            'created_at'  => Carbon::parse('2025-04-24 12:00:00'),
            'updated_at'  => Carbon::parse('2025-04-24 12:00:00'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pais');
    }
};
