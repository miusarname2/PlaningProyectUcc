<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuraciones';

    protected $fillable = [
        'clave',
        'valor',
        'tipo',
        'descripcion'
    ];

    protected $casts = [
        'valor' => 'string',
    ];

    /**
     * Obtener el valor de una configuración por clave
     */
    public static function getValue(string $clave, $default = null)
    {
        $config = self::where('clave', $clave)->first();

        if (!$config) {
            return $default;
        }

        return self::castValue($config->valor, $config->tipo);
    }

    /**
     * Establecer el valor de una configuración
     */
    public static function setValue(string $clave, $valor, string $tipo = 'string', string $descripcion = null)
    {
        return self::updateOrCreate(
            ['clave' => $clave],
            [
                'valor' => (string) $valor,
                'tipo' => $tipo,
                'descripcion' => $descripcion
            ]
        );
    }

    /**
     * Convertir el valor según el tipo
     */
    private static function castValue(string $valor, string $tipo)
    {
        switch ($tipo) {
            case 'boolean':
                return filter_var($valor, FILTER_VALIDATE_BOOLEAN);
            case 'integer':
                return (int) $valor;
            case 'float':
                return (float) $valor;
            case 'json':
                return json_decode($valor, true);
            default:
                return $valor;
        }
    }

    /**
     * Verificar si el login está habilitado
     */
    public static function isLoginEnabled(): bool
    {
        return self::getValue('login_enabled', true);
    }
}
