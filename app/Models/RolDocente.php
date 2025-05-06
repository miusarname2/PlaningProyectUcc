<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RolDocente extends Model
{
    protected $table = 'rolDocente';

    protected $primaryKey = 'idRolDocente';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
    ];

    public function profesionales()
    {
        return $this->belongsToMany(
            Profesional::class,
            'profesional_rol',
            'idRolDocente',
            'idProfesional'
        );
    }
}
