<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SedePrestamo extends Model
{
    use HasFactory;

    protected $table = 'sede_prestamos';
    protected $primaryKey = 'idPrestamo';

    protected $fillable = [
        'idSede',
        'idEntidadPrestamista',
        'idEntidadPrestataria',
        'fechaInicio',
        'fechaFin',
        'estado',
    ];

    // Relación inversa a Sede
    public function sede()
    {
        return $this->belongsTo(Sede::class, 'idSede', 'idSede');
    }

    // Relación al prestamista
    public function prestamista()
    {
        return $this->belongsTo(Entidad::class, 'idEntidadPrestamista', 'idEntidad');
    }

    // Relación a la prestataria
    public function prestataria()
    {
        return $this->belongsTo(Entidad::class, 'idEntidadPrestataria', 'idEntidad');
    }
}
