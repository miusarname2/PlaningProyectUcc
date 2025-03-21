<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grupo extends Model
{
    use HasFactory;

    protected $table = 'Grupo';

    protected $primaryKey = 'idGrupo';

    protected $fillable = [
        'nombre',
        'descripcion',
    ];
}
