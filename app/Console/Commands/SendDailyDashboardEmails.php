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

        // Buscar todos los cursos que terminan en los próximos 15 días
        $cursos = Curso::whereBetween('fecha_fin', [
            $today,
            $today->copy()->addDays(15),
        ])->get();

        if ($cursos->isEmpty()) {
            return $this->info('No hay cursos próximos a vencer hoy.');
        }

        // Perfiles válidos
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
            fn($q) => $q->whereIn('idPerfil', $perfilIds)
        )->get();

        if ($usuarios->isEmpty()) {
            return $this->info('No hay usuarios con perfil Admin o Planeador.');
        }

        $resend = Resend::client(config('services.resend.key'));

        foreach ($usuarios as $usuario) {
            try {
                $resend->emails->send([
                    'from'    => config('services.resend.from'),
                    'to'      => $usuario->email,
                    'subject' => "📘 Recordatorio: {$cursos->count()} cursos por vencer",
                    'html'    => view('emails.course-ending', [
                        'usuario' => $usuario,
                        'cursos'  => $cursos,
                    ])->render(),
                ]);

                $this->info("Correo enviado a {$usuario->email}");

                sleep(1); // Control de frecuencia

            } catch (\Exception $e) {
                $this->error("Error al enviar a {$usuario->email}: " . $e->getMessage());
            }
        }

        $this->info('Todos los correos han sido enviados correctamente.');
    }
}
