<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    use HasFactory;

    protected $table = 'Usuario';

    protected $primaryKey = 'idUsuario';

    protected $fillable = [
        'nombre',
        'password',
        'idRol'
    ];

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'idRol', 'idRol');
    }

    public function grupos()
    {
        return $this->belongsToMany(Grupo::class, 'Usuarios_Grupos', 'idUsuario', 'idGrupo');
    }

}
