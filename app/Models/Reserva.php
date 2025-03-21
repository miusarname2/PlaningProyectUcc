<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    use HasFactory;

    protected $table = 'Reserva';

    protected $primaryKey = 'idReserva';

    protected $fillable = [
        'idUsuario',
        'idImplemento',
        'fecha',
        'hora',
        'estado'
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'idUsuario', 'idUsuario');
    }

    public function implemento()
    {
        return $this->belongsTo(Implemento::class, 'idImplemento', 'idImplemento');
    }
}
