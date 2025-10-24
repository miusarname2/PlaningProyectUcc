<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    use HasFactory;

    protected $table = 'configuraciones';

    protected $fillable = [
        'clave',
        'valor',
        'descripcion',
    ];

    /**
     * Obtener el valor de una configuración por clave
     */
    public static function getValor(string $clave, $default = null)
    {
        $config = static::where('clave', $clave)->first();
        return $config ? $config->valor : $default;
    }

    /**
     * Establecer el valor de una configuración por clave
     */
    public static function setValor(string $clave, string $valor, string $descripcion = null)
    {
        return static::updateOrCreate(
            ['clave' => $clave],
            [
                'valor' => $valor,
                'descripcion' => $descripcion,
            ]
        );
    }

    /**
     * Verificar si el login está habilitado
     */
    public static function isLoginEnabled()
    {
        return static::getValor('login_enabled', 'false') === 'true';
    }

    /**
     * Habilitar o deshabilitar el login
     */
    public static function setLoginEnabled(bool $enabled)
    {
        return static::setValor(
            'login_enabled',
            $enabled ? 'true' : 'false',
            'Habilita o deshabilita el login manual. Si está deshabilitado, se usa autenticación automática con usuario ID 1'
        );
    }
}
