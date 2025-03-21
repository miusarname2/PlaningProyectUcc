<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Clase extends Model
{
    use HasFactory;

    protected $table = 'Clase';

    protected $primaryKey = 'idClase';

    protected $fillable = [
        'idMateria',
        'idGrupo',
        'idUsuario',
        'idAula',
    ];


    public function materia()
    {
        return $this->belongsTo(Materia::class, 'idMateria');
    }

    public function grupo()
    {
        return $this->belongsTo(Grupo::class, 'idGrupo', 'idGrupo');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario', 'idUsuario');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'idAula', 'idAula');
    }
}
