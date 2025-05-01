<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ciudad extends Model
{
    use HasFactory;

    protected $table = 'ciudad';

    protected $primaryKey = 'idCiudad';

    protected $fillable = [
        'nombre',
        'codigoPostal',
        'idRegion',
        'idEstado'
    ];

    public function Region()
    {
        return $this->belongsTo(Region::class,'idRegion','idRegion');
    }

    public function sedes()
    {
        return $this->hasMany(Sede::class,'idCiudad','idCiudad');
    }

}
