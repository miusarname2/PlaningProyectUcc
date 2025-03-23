<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HorarioClase extends Model
{
    use HasFactory;

    protected $table = 'Horarios_Clase';

    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'idClase',
        'idDia',
        'idHora'
    ];

    public function clase()
    {
        return $this->belongsTo(Clase::class);
    }

    public function dia()
    {
        return $this->belongsTo(Dia::class);
    }

    public function hora()
    {
        return $this->belongsTo(Hora::class);
    }
}
