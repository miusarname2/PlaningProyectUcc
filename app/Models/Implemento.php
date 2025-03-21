<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Implemento extends Model
{
    use HasFactory;

    protected $table = 'Implemento';

    protected $primaryKey = 'idImplemento';

    protected $fillable = [
        'nombre',
        'idAula'
    ];

    public function aula()
    {
        return $this->belongsTo(Aula::class, 'idAula', 'idAula');
    }
}
