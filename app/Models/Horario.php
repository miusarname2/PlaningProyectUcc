<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    use HasFactory;

    protected $table = 'horario';
    protected $primaryKey = 'idHorario';

    protected $fillable = [
        'idCurso',
        'idAula'
    ];


    public function curso()
    {
        return $this->belongsTo(Curso::class, 'idCurso', 'idCurso');
    }

    public function profesionales()
    {
        return $this->belongsToMany(
            Profesional::class,
            'horario_profesional',
            'idHorario',
            'idProfesional'
        )
            ->withPivot('idRolDocente');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'idAula', 'idAula');
    }

    public function dias()
    {
        return $this->belongsToMany(
            Dia::class,
            'horario_dia',
            'idHorario',
            'idDia'
        )
            ->withPivot('hora_inicio', 'hora_fin');
    }
}
