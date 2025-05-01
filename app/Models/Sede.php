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
        'idCiudad',
        'idEntidadPropietaria'
    ];

    public function ciudad()
    {
        return $this->belongsTo(Ciudad::class,'idCiudad','idCiudad');
    }

    public function propietario()
    {
        return $this->belongsTo(Entidad::class, 'idEntidadPropietaria', 'idEntidad');
    }

     public function prestamos()
    {
        return $this->hasMany(SedePrestamo::class, 'idSede', 'idSede');
    }

    public function prestatarias()
    {
        return $this->belongsToMany(
            Entidad::class,
            'sede_prestamos',
            'idSede',
            'idEntidadPrestataria'
        )->withPivot(['idPrestamo','fechaInicio','fechaFin','estado']);
    }
}
