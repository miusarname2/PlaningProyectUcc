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
        Schema::create('ciudad', function (Blueprint $table) {
            $table->increments('idCiudad');
            $table->string('nombre', 100);
            $table->string('codigoPostal', 10)->nullable();
            $table->unsignedInteger('idRegion');
            $table->unsignedInteger('idEstado');
            $table->timestamps();
            $table->foreign('idRegion')->references('idRegion')->on('region')->onDelete('cascade');
            $table->foreign('idEstado')->references('idEstado')->on('estado')->onDelete('cascade');
        });

        // Insertar ciudades predefinidas
        DB::table('ciudad')->insert([
            [
                'idCiudad'    => 1,
                'nombre'      => 'Bogotá',
                'codigoPostal'=> null,
                'idRegion'    => 2,
                'idEstado'    => 26,
                'created_at'  => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at'  => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idCiudad'    => 2,
                'nombre'      => 'Medellín',
                'codigoPostal'=> null,
                'idRegion'    => 2,
                'idEstado'    => 23,
                'created_at'  => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at'  => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idCiudad'    => 6,
                'nombre'      => 'Cúcuta',
                'codigoPostal'=> null,
                'idRegion'    => 2,
                'idEstado'    => 28,
                'created_at'  => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at'  => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idCiudad'    => 9,
                'nombre'      => 'Soacha',
                'codigoPostal'=> null,
                'idRegion'    => 2,
                'idEstado'    => 26,
                'created_at'  => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at'  => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idCiudad'    => 10,
                'nombre'      => 'Bucaramanga',
                'codigoPostal'=> null,
                'idRegion'    => 2,
                'idEstado'    => 31,
                'created_at'  => Carbon::parse('2025-04-24 12:00:00'),
                'updated_at'  => Carbon::parse('2025-04-24 12:00:00'),
            ],
            [
                'idCiudad'    => 12,
                'nombre'      => 'Cucuta',
                'codigoPostal'=> '000000',
                'idRegion'    => 2,
                'idEstado'    => 28,
                'created_at'  => Carbon::parse('2025-05-02 22:07:53'),
                'updated_at'  => Carbon::parse('2025-05-02 22:07:53'),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ciudad');
    }
};
