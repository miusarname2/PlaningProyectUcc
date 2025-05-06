<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dia extends Model
{
    protected $table = 'dia';
    protected $primaryKey = 'idDia';

    protected $fillable = ['nombre'];

    public function horarios()
    {
        return $this->belongsToMany(
            Horario::class,
            'horario_dia',
            'idDia',
            'idHorario'
        )
            ->withPivot('hora_inicio', 'hora_fin')
            ->withTimestamps();
    }
}
