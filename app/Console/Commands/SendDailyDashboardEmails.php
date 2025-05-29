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
    protected $description = 'Envía recordatorios de cursos próximos a vencer';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();

        // Cursos que acaban en ≤15 días
        $cursos = Curso::whereBetween('fecha_fin', [
            $today,
            $today->copy()->addDays(15),
        ])->get();

        if ($cursos->isEmpty()) {
            return $this->info('No hay cursos próximos a vencer hoy.');
        }

        // IDs de perfiles
        $perfilIds = Perfil::whereIn('nombre', [
            'Administrador General',
            'admon',
            'Planeador',
        ])->pluck('idPerfil');

        if ($perfilIds->isEmpty()) {
            return $this->info('No existen perfiles Admin/Planeador configurados.');
        }

        // Usuarios con esos perfiles
        $usuarios = Usuario::whereHas(
            'usuarioPerfil',
            fn($q) =>
            $q->whereIn('idPerfil', $perfilIds)
        )->get();

        if ($usuarios->isEmpty()) {
            return $this->info('No hay usuarios con perfil Admin o Planeador.');
        }

        // Instancia única del cliente Resend
        $resend = Resend::client(config('services.resend.key'));

        foreach ($cursos as $curso) {
            $daysLeft = $today->diffInDays(Carbon::parse($curso->fecha_fin));

            foreach ($usuarios as $usuario) {
                if ($daysLeft === 0) {
                    $subject = "Hoy termina el curso: {$curso->nombre}";
                } else {
                    $subject = "Faltan {$daysLeft} días para que termine el curso: {$curso->nombre}";
                }

                try {
                    $resend->emails->send([
                        'from'    => config('services.resend.from'),
                        'to'      => $usuario->email,
                        'subject' => $subject,
                        'html'    => view('emails.course-ending', [
                            'usuario'  => $usuario,
                            'curso'    => $curso,
                            'daysLeft' => $daysLeft,
                        ])->render(),
                    ]);

                    $this->info("Enviado a {$usuario->email}: {$subject}");

                    // Espera para evitar que Resend bloquee por frecuencia
                    sleep(1); // puedes ajustar a 2 o más si tienes muchos usuarios

                } catch (\Exception $e) {
                    $this->error("Error al enviar a {$usuario->email}: " . $e->getMessage());
                }
            }
        }

        $this->info('Recordatorios enviados a todos los Administradores Generales y Planeadores.');
    }
}
