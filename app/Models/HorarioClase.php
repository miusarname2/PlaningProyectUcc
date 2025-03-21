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

}
