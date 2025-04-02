<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pais extends Model
{
    use HasFactory;

    protected $table ='Pais';

    protected $primaryKey = 'idPais';

    protected $fillable = [
        'nombre',
        'descripcion'
    ];

    public function regiones()
    {
        return $this->hasMany(Region::class,'idPais','idPais');
    }

}
