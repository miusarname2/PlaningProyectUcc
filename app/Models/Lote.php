<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lote extends Model
{
    use HasFactory;

    protected $table = 'lote';
    protected $primaryKey = 'idLote';

    protected $fillable = [
        'codigo',
        'nombre',
        'idCiudad',
        'fechaInicio',
        'FechaFin',
        'numEstudiantes',
        'estado'
    ];

    // Relación: un lote pertenece a un programa
    public function programa()
    {
        return $this->belongsTo(Ciudad::class, 'idCiudad', 'idCiudad');
    }
}
