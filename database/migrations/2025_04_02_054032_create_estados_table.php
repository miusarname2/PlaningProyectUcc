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
        Schema::create('estado', function (Blueprint $table) {
            $table->increments('idEstado');
            $table->string('nombre', 100);
            $table->text('descripcion')->nullable();
            $table->unsignedInteger('idRegion');
            $table->timestamps();


            $table->foreign('idRegion')
                ->references('idRegion')
                ->on('region')
                ->onDelete('cascade');
        });

        DB::table('estado')->insert([
            ['idEstado' => 1,  'nombre' => 'Amazonas',               'descripcion' => 'Departamento de selva amazónica. Capital: Leticia.',                'idRegion' => 1, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 2,  'nombre' => 'Caquetá',                 'descripcion' => 'Departamento amazónico. Capital: Florencia.',                              'idRegion' => 1, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 4,  'nombre' => 'Guaviare',                'descripcion' => 'Departamento amazónico. Capital: San José del Guaviare.',                   'idRegion' => 1, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 5,  'nombre' => 'Putumayo',                'descripcion' => 'Departamento amazónico. Capital: Mocoa.',                                  'idRegion' => 1, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 6,  'nombre' => 'Vaupés',                  'descripcion' => 'Departamento amazónico. Capital: Mitú.',                                   'idRegion' => 1, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 7,  'nombre' => 'Arauca',                  'descripcion' => 'Departamento de llanura oriental. Capital: Arauca.',                       'idRegion' => 4, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 8,  'nombre' => 'Casanare',                'descripcion' => 'Departamento de sabanas. Capital: Yopal.',                                 'idRegion' => 4, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 9,  'nombre' => 'Meta',                    'descripcion' => 'Departamento de llanura. Capital: Villavicencio.',                         'idRegion' => 4, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 10, 'nombre' => 'Vichada',                 'descripcion' => 'Departamento de llanura. Capital: Puerto Carreño.',                        'idRegion' => 4, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 11, 'nombre' => 'Chocó',                   'descripcion' => 'Departamento pacífico con alta pluviometría. Capital: Quibdó.',           'idRegion' => 5, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 12, 'nombre' => 'Valle del Cauca',         'descripcion' => 'Departamento pacífico. Capital: Cali.',                                   'idRegion' => 5, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 13, 'nombre' => 'Cauca',                   'descripcion' => 'Departamento pacífico y andino. Capital: Popayán.',                       'idRegion' => 5, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 14, 'nombre' => 'Nariño',                  'descripcion' => 'Departamento pacífico y andino. Capital: Pasto.',                         'idRegion' => 5, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 23, 'nombre' => 'Antioquia',               'descripcion' => 'Departamento andino. Capital: Medellín.',                                  'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 24, 'nombre' => 'Boyacá',                  'descripcion' => 'Departamento andino. Capital: Tunja.',                                    'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 25, 'nombre' => 'Caldas',                  'descripcion' => 'Departamento andino. Capital: Manizales.',                                'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 26, 'nombre' => 'Cundinamarca',            'descripcion' => 'Departamento andino. Capital: Bogotá D.C.',                               'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 27, 'nombre' => 'Huila',                   'descripcion' => 'Departamento andino. Capital: Neiva.',                                    'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 28, 'nombre' => 'Norte de Santander',      'descripcion' => 'Departamento andino. Capital: Cúcuta.',                                  'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 29, 'nombre' => 'Quindío',                 'descripcion' => 'Departamento andino. Capital: Armenia.',                                 'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 30, 'nombre' => 'Risaralda',               'descripcion' => 'Departamento andino. Capital: Pereira.',                                'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
            ['idEstado' => 31, 'nombre' => 'Santander',               'descripcion' => 'Departamento andino. Capital: Bucaramanga.',                            'idRegion' => 2, 'created_at' => Carbon::parse('2025-04-24 12:00:00'), 'updated_at' => Carbon::parse('2025-04-24 12:00:00')],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estado');
    }
};
