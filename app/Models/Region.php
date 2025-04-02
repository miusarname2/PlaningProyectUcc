<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    use HasFactory;

    protected $table = 'Region';

    protected $primaryKey = 'idRegion';

    protected $fillable = [
        'nombre',
        'descripcion',
        'idPais'
    ];

    public function pais()
    {
        return $this->belongsTo(Pais::class,'idPais','idPais');
    }

    public function Ciudades()
    {
        return $this->hasMany(Ciudad::class,'idRegion','idRegion');
    }    

}
