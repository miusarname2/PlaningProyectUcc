<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proceso extends Model
{
    use HasFactory;

    protected $table = 'proceso';
    protected $primaryKey = 'idProceso';
    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'cantidadPasos',
        'idDepartamento',
        'estado'
    ];

    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'idDepartamento', 'idProceso');
    }
    

}
