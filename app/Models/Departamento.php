<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Departamento extends Model
{
    use HasFactory;

    protected $table = 'departamento';
    protected $primaryKey = 'idDepartamento';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function especialidades()
    {
        return $this->hasMany(Especialidad::class,'idDepartamento','idDepartamento');
    }
}
