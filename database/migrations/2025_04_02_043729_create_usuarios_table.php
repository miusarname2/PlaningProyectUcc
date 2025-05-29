<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('usuario', function (Blueprint $table) {
            $table->increments('idUsuario');
            $table->string('username',50);
            $table->string('email',100)->unique();
            $table->enum('estado', ['Activo','Inactivo']);
            $table->dateTime('ultimoAcceso');
            $table->string('nombreCompleto',100);
            $table->string('password');
            $table->timestamps();
        });

        // Insertar el usuario administrador - Inicial
        DB::table('usuario')->insert([
            'username'       => 'admin',
            'email'          => 'admin@planing.omag.cloud',
            'estado'         => 'Activo',
            'ultimoAcceso'   => Carbon::now(),              // Fecha y hora actuales
            'nombreCompleto' => 'Administrador del Sistema',
            'password'       => Hash::make('TuPasswordSeguro123!'),  // Cambia por una contraseña fuerte
            'created_at'     => Carbon::now(),
            'updated_at'     => Carbon::now(),
        ]);

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuario');
    }
};
