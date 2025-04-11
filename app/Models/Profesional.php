<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profesional extends Model
{
    use HasFactory;

    protected $table = 'profesional';
    protected $primaryKey = 'idProfesional';

    protected $fillable = [
        'codigo',
        'nombreCompleto',
        'email',
        'titulo',
        'experiencia',
        'estado',
        'perfil'
    ];

    // Relación muchos a muchos con Especialidad
    public function especialidades()
    {
        return $this->belongsToMany(
            Especialidad::class,
            'profesional_especialidad',
            'idProfesional',
            'idEspecialidad'
        );
    }

}
