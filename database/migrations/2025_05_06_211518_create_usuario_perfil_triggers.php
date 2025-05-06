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
        DB::unprepared(
            <<<'SQL'
CREATE TRIGGER trg_usuario_perfil_after_insert
AFTER INSERT ON usuario_perfil
FOR EACH ROW
BEGIN
  IF NEW.idPerfil IS NOT NULL THEN
    INSERT INTO usuario_rol (idUsuario, idRol)
    SELECT NEW.idUsuario, pr.idRol
    FROM perfil_rol pr
    WHERE pr.idPerfil = NEW.idPerfil;
  END IF;
END;
SQL
        );

        // Trigger AFTER UPDATE
        DB::unprepared(
            <<<'SQL'
CREATE TRIGGER trg_usuario_perfil_after_update
AFTER UPDATE ON usuario_perfil
FOR EACH ROW
BEGIN
  DELETE FROM usuario_rol WHERE idUsuario = NEW.idUsuario;

  IF NEW.idPerfil IS NOT NULL THEN
    INSERT INTO usuario_rol (idUsuario, idRol)
    SELECT NEW.idUsuario, pr.idRol
    FROM perfil_rol pr
    WHERE pr.idPerfil = NEW.idPerfil;
  END IF;
END;
SQL
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_usuario_perfil_after_insert;');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_usuario_perfil_after_update;');
    }
};
