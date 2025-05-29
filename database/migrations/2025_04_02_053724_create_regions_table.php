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
        Schema::create('region', function (Blueprint $table) {
            $table->increments('idRegion');
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('idPais');
            $table->foreign('idPais')->references('idPais')->on('pais')->onDelete('cascade');
            $table->timestamps();
        });

        DB::table('region')->insert([
            [
                'idRegion'   => 1,
                'nombre'     => 'Región Amazónica',
                'descripcion' => 'Zona de selva tropical y ríos de la cuenca amazónica.',
                'idPais'     => 1,
                'created_at' => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at' => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idRegion'   => 2,
                'nombre'     => 'Región Andina',
                'descripcion' => 'Área montañosa de la cordillera de los Andes, corazón demográfico y económico.',
                'idPais'     => 1,
                'created_at' => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at' => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idRegion'   => 4,
                'nombre'     => 'Región Orinoquía',
                'descripcion' => 'Llanuras orientales drenadas por el río Orinoco, predominio de ganadería y sabanas.',
                'idPais'     => 1,
                'created_at' => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at' => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idRegion'   => 5,
                'nombre'     => 'Región Pacífica',
                'descripcion' => 'Costa del Pacífico con selvas húmedas y alta pluviometría.',
                'idPais'     => 1,
                'created_at' => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at' => Carbon::parse('2025-04-24 12:00:00'),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('region');
    }
};
