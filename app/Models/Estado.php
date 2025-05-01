<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estado extends Model
{
    use HasFactory;

    protected $table = 'estado';

    protected $primaryKey = 'idEstado';

    protected $fillable = [
        'nombre',
        'descripcion',
        'idRegion'
    ];

    public function region()
    {
        return $this->belongsTo(Region::class, 'idRegion', 'idRegion');
    }

}
