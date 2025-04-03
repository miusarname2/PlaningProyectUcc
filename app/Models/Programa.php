<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Programa extends Model
{
    use HasFactory;

    protected $table = 'programa';
    protected $primaryKey = 'idPrograma';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'duracion',
        'idEspecialidad',
        'estado'
    ];

    // Un programa pertenece a una especialidad
    public function especialidad()
    {
        return $this->belongsTo(Especialidad::class, 'idEspecialidad', 'idEspecialidad');
    }

}
