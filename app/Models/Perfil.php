<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perfil extends Model
{
    use HasFactory;

    protected $table = 'Perfil';

    protected $primaryKey = 'idPerfil';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function roles()
    {
        return $this->belongsToMany(Rol::class,'perfil_rol','idPerfil','idRol');
    }

}
