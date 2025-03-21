<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Hora extends Model
{
    use HasFactory;

    protected $table = 'Hora';

    protected $primaryKey = 'idHora';

    protected $fillable = [
        'hora'
    ];
}
