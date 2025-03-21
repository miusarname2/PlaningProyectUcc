<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'Aula';

    protected $primaryKey = 'idAula';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'Usuarios_Grupos', 'idGrupo', 'idUsuario');
    }
}
