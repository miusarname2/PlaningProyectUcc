<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Entidad extends Model
{
    use HasFactory;

    protected $table = 'entidad';

    protected $primaryKey = 'idEntidad';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'estado',
        'contacto'
    ];

    public function sedesPropias()
    {
        return $this->hasMany(Sede::class, 'idEntidadPropietaria', 'idEntidad');
    }

    // Préstamos donde es la entidad que presta (1:N)
    public function prestamosComoPrestamista()
    {
        return $this->hasMany(SedePrestamo::class, 'idEntidadPrestamista', 'idEntidad');
    }

    // Préstamos donde es la entidad que recibe (1:N)
    public function prestamosComoPrestataria()
    {
        return $this->hasMany(SedePrestamo::class, 'idEntidadPrestataria', 'idEntidad');
    }

    // Sedes tomadas en préstamo (N:M)
    public function sedesPrestadas()
    {
        return $this->belongsToMany(
            Sede::class,
            'sede_prestamos',
            'idEntidadPrestataria',
            'idSede'
        )->withPivot(['idPrestamo','fechaInicio','fechaFin','estado']);
    }
    
}
