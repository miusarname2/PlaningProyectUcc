<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sede extends Model
{
    use HasFactory;

    protected $table = 'sede';

    protected $primaryKey = 'idSede';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'tipo',
        'acceso',
        'idCiudad'
    ];

    public function ciudad()
    {
        return $this->belongsTo(Sede::class,'idCiudad','idCiudad');
    }

}
