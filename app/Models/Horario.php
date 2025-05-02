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
        'idProfesional',
        'idAula',
        'dia',
        'hora_inicio',
        'hora_fin',
    ];

    // Casteo de columnas de tiempo a instancias Carbon
    protected $casts = [
        'hora_inicio' => 'datetime:H:i:s',
        'hora_fin'    => 'datetime:H:i:s',
    ];


    // Relación: un horario pertenece a un curso
    public function curso()
    {
        return $this->belongsTo(Curso::class, 'idCurso', 'idCurso');
    }

    // Relación: un horario pertenece a un profesional
    public function profesional()
    {
        return $this->belongsTo(Profesional::class, 'idProfesional', 'idProfesional');
    }

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'idAula', 'idAula');
    }

}
