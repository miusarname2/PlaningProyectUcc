<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Especialidad extends Model
{
    use HasFactory;

    protected $table = 'especialidad';
    protected $primaryKey = 'idEspecialidad';

    protected $fillable = ['nombre', 'codigo', 'descripcion', 'idDepartamento', 'estado'];

    // Una especialidad pertenece a un departamento
    public function departamento()
    {
        return $this->belongsTo(Departamento::class, 'idDepartamento', 'idDepartamento');
    }

    // Relación muchos a muchos con Profesional
    public function profesionales()
    {
        return $this->belongsToMany(
            Profesional::class,
            'profesional_especialidad',
            'idEspecialidad',
            'idProfesional'
        );
    }

    // Una especialidad puede tener muchos programas
    public function programas()
    {
        return $this->hasMany(Programa::class, 'idEspecialidad', 'idEspecialidad');
    }
}
