<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profesional extends Model
{
    use HasFactory;

    protected $table = 'profesional';
    protected $primaryKey = 'idProfesional';

    protected $fillable = [
        'codigo',
        'identificacion',
        'nombreCompleto',
        'email',
        'titulo',
        'experiencia',
        'estado',
        'perfil'
    ];

    public function roles()
    {
        return $this->belongsToMany(RolDocente::class, 'profesional_rol', 'idProfesional', 'idRol');
    }

    public function horarios()
    {
        return $this->belongsToMany(
            Horario::class,
            'horario_profesional',
            'idProfesional',
            'idHorario'
        )
            ->withPivot('idRolDocente');
    }
}
