<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UsuarioPerfil extends Model
{
    use HasFactory;

    protected $table = 'usuario_perfil';

    protected $primaryKey = 'idUsuario';

    protected $fillable = [
        'idUsuario',
        'idPerfil'
    ];

    public $timestamps = false;

    public function usuario()
    {
        return $this->belongsTo(Usuario::class,'idUsuario');
    }

    public function perfil()
    {
        return $this->belongsTo(Perfil::class,'idPerfil');
    }

}
