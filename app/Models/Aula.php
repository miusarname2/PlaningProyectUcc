<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Aula extends Model
{
    use HasFactory;

    protected $table = 'aula';
    protected $primaryKey = 'idAula';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'idSede',
        'capacidad',
        'estado',
    ];

    public function sede()
    {
        return $this->belongsTo(Sede::class, 'idSede', 'idSede');
    }
}
