<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Dia extends Model
{
    use HasFactory;

    protected $table = 'Dia';

    protected $primaryKey = 'idDia';

    protected $fillable = [
        'nombre'    ];
}
