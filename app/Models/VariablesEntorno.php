<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VariablesEntorno extends Model
{
    use HasFactory;

    protected $table = 'variableEntorno';

    protected $fillable = [
        'nombre',
        'valor'
    ];

}
