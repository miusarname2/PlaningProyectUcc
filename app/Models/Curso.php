<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    protected $table = 'Curso';

    protected $primaryKey = 'idCurso';

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'creditos',
        'horas',
        'estado'
    ];

    // Relación muchos a muchos con Programa
    public function programas()
    {
        return $this->belongsToMany(Programa::class, 'curso_programa', 'idCuros', 'idPrograma');
    }

    // Relación muchos a muchos con Especialidad
    public function especialidades()
    {
        return $this->belongsToMany(Especialidad::class, 'curso_especialidad', 'idCurso', 'idEspecialidad');
    }

    // Relación uno a muchos con Horario
    public function horarios()
    {
        return $this->hasMany(Horario::class, 'idCurso', 'idCurso');
    }

}
