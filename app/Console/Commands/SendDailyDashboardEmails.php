<?php

namespace App\Console\Commands;

use App\Models\Curso;
use App\Models\Perfil;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Resend;

class SendDailyDashboardEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-daily-dashboard-emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        // 1) Cursos a vencer en ≤15 días desde hoy
        $cursos = Curso::whereBetween('fecha_fin', [
            $today,
            $today->copy()->addDays(15)
        ])->get();

        if ($cursos->isEmpty()) {
            $this->info('No hay cursos próximos a vencer hoy.');
            return;
        }

        // 2) IDs de perfiles Admin y Planeador
        $perfilIds = Perfil::whereIn('nombre', [
            'Administrador General',
            'Planeador'
        ])->pluck('idPerfil');

        if ($perfilIds->isEmpty()) {
            $this->info('No existen perfiles Admin/Planeador configurados.');
            return;
        }

        // 3) Usuarios con esos perfiles
        $usuarios = Usuario::whereHas('usuarioPerfil', function ($q) use ($perfilIds) {
            $q->whereIn('idPerfil', $perfilIds);
        })
            ->get();

        if ($usuarios->isEmpty()) {
            $this->info('No hay usuarios con perfil Admin o Planeador.');
            return;
        }

        // 4) Iterar cursos y enviar emails
        foreach ($cursos as $curso) {
            $daysLeft = $today->diffInDays(Carbon::parse($curso->fecha_fin));

            foreach ($usuarios as $usuario) {
                // 5) Chequeo diario: pivot no tiene timestamp, 
                //    evitamos duplicar en un mismo handle()
                //    (en un cron real usarías una tabla de logs o pivot con timestamp)

                // 6) Preparar asunto y cuerpo
                if ($daysLeft === 0) {
                    $subject = "Hoy termina el curso: {$curso->nombre}";
                    $body    = "¡Hoy es el último día de tu curso “{$curso->nombre}”!";
                } else {
                    $subject = "Faltan {$daysLeft} días para que termine el curso: {$curso->nombre}";
                    $body    = "Faltan {$daysLeft} días para que termine el curso “{$curso->nombre}”. ¿Deseas renovarlo o reemplazarlo?";
                }

                $resend = Resend::client('re_evHz5XXk_AJCQkAxt9eSxHkzaKUs92j3U');

                $resend->emails->send([
                    'from' => 'Planing Proyect <noreply@planingproyect.com>',
                    'to'      => $usuario->email,
                    'subject' => $subject,
                    'html'    => view('emails.course-ending', [
                        'usuario'  => $usuario,
                        'curso'    => $curso,
                        'daysLeft' => $daysLeft,
                    ])->render(),
                ]);

                 // 7) Envío con Resend

                $this->info("Enviado a {$usuario->email}: {$subject}");
            }
        }

        $this->info('Recordatorios enviados a todos los Administradores Generales y Planeadores.');
    }
}
