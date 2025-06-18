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
        'perfil',
        'contrato',
        'numeroContratos',
        'disponibilidad',
        'idCiudad'
    ];

    public function roles()
    {
        return $this->belongsToMany(RolDocente::class, 'profesional_rol', 'idProfesional', 'idRolDocente');
    }

    public function ciudad()
    {
        return $this->belongsTo(Ciudad::class, 'idCiudad');
    }

    public function lotes()
    {
        return $this->belongsToMany(
            Lote::class,
            'lote_profesional',
            'idProfesional',
            'idLote'
        );
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
