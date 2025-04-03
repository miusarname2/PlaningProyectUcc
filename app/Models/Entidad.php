<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entidad extends Model
{
    use HasFactory;

    protected $table = 'Entidad';

    protected $primaryKey = 'idEntidad';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'estado',
        'contacto'
    ];

    
}
