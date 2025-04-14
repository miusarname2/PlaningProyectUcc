<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    use HasFactory;

    protected $table = 'perfil';

    protected $primaryKey = 'idPerfil';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function roles()
    {
        return $this->belongsToMany(Rol::class,'perfil_rol','idPerfil','idRol');
    }

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class,'usuario_perfil','idPerfil','idUsuario');
    }
}
