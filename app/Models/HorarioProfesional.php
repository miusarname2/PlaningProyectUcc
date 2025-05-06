<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class HorarioProfesional extends Pivot
{
    protected $table = 'horario_profesional';


    public function rolDocente()
    {
        return $this->belongsTo(RolDocente::class, 'idRolDocente', 'idRol');
    }
}
