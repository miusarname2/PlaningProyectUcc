<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Curso extends Model
{
    use HasFactory;

    protected $table = 'curso';

    protected $primaryKey = 'idCurso';

    protected $fillable = [
        'codigo',
        'codigoGrupo',
        'nombre',
        'descripcion',
        'nivel',
        'cohorte',
        'creditos',
        'horas',
        'estado'
    ];

    protected $casts = [
        'cohorte'   => 'integer',
        'creditos'  => 'integer',
    ];

    public const NIVELES = ['Avanzado', 'Intermedio', 'Basico'];

    public const ESTADOS = ['Activo', 'Inactivo'];

    // Relación muchos a muchos con Programa
    public function programas()
    {
        return $this->belongsToMany(Programa::class, 'curso_programa', 'idCurso', 'idPrograma');
    }


    // Relación uno a muchos con Horario
    public function horarios()
    {
        return $this->hasMany(Horario::class, 'idCurso', 'idCurso');
    }

}
