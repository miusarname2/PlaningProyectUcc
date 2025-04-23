<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerfilRol extends Model
{
    use HasFactory;

    protected $table = 'perfil_rol';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = ['idPerfil', 'idRol'];

    public function perfil()
    {
        return $this->belongsTo(Perfil::class, 'idPerfil', 'idPerfil');
    }

    public function rol()
    {
        return $this->belongsTo(Rol::class, 'idRol', 'idRol');
    }

}
