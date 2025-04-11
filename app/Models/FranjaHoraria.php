<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FranjaHoraria extends Model
{
    use HasFactory;

    protected $table = 'franja_horaria';
    protected $primaryKey = 'idFranjaHoraria';

    protected $fillable = [
        'codigo',
        'nombre',
        'horaInicio',
        'horaFin',
        'duracionMinutos',
        'tipo',
        'estado'
    ];

    public function horarios()
    {
        return $this->hasMany(Horario::class, 'idFranjaHoraria', 'idFranjaHoraria');
    }
    
}
