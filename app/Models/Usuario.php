<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Model
{
    use HasFactory,HasApiTokens;

    protected $table = 'usuario';

    protected $primaryKey = 'idUsuario';

    protected $fillable = [
        'username',
        'email',
        'estado',
        'password',
        'nombreCompleto',
        'ultimoAcceso'
    ];

    protected $hidden = [
        'password',
    ];

    public function roles()
    {
        return $this->belongsToMany(Rol::class,'usuario_rol','idUsuario','idRol');
    }

    public function usuarioPerfil()
    {
        return $this->hasOne(UsuarioPerfil::class,'idUsuario','idUsuario');
    }

}
