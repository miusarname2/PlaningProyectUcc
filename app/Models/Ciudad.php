<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ciudad extends Model
{
    use HasFactory;

    protected $table = 'Ciudad';

    protected $primaryKey = 'idCiudad';

    protected $fillable = [
        'nombre',
        'codigoPostal',
        'idRegion'
    ];

    public function Region()
    {
        return $this->belongsTo(Region::class,'idRegion','idRegion');
    }

    public function sedes()
    {
        return $this->hasMany(Sedes::class,'idCiudad','idCiudad');
    }

}
