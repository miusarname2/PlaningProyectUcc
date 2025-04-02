<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    use HasFactory;

    protected $table = 'Rol';

    protected $primaryKey = 'idRol';

    protected $fillable = [
        'nombre',
        'descripcion',
        'permisos'
    ];

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class,'usuario_rol','idRol','idUsuario');
    }

    public function perfiles()
    {
        return $this->belongsToMany(Perfil::class,'perfil_rol','idRol','idPerfil');
    }

}
