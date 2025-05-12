<?php

namespace App\Console\Commands;

use App\Models\Curso;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Resend\Laravel\Facades\Resend;

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

        // 1) Obtenemos cursos con fecha_fin entre hoy y hoy+15 días
        $cursos = Curso::whereBetween('fecha_fin', [
            $today,
            $today->copy()->addDays(15)
        ])->get();

        foreach ($cursos as $curso) {
            $daysLeft = $today->diffInDays(Carbon::parse($curso->fecha_fin));

            // 2) Iteramos solo usuarios con perfil Administrador General o Planeador
            $curso->usuarios()
                  ->whereHas('perfiles', function($q) {
                      $q->whereIn('nombre', ['Administrador General', 'Planeador']);
                  })
                  ->chunkById(100, function($usuarios) use ($curso, $daysLeft) {
                      foreach ($usuarios as $usuario) {
                          // 3) Saltar si ya enviamos hoy
                          $last = $usuario->pivot->last_notification_sent_at;
                          if ($last && Carbon::parse($last)->isToday()) {
                              continue;
                          }

                          // 4) Construir asunto y cuerpo
                          if ($daysLeft === 0) {
                              $subject = "Hoy termina el curso: {$curso->nombre}";
                              $body    = "¡Hoy es el último día de tu curso “{$curso->nombre}”!";
                          } else {
                              $subject = "Faltan {$daysLeft} días para que termine el curso: {$curso->nombre}";
                              $body    = "Faltan {$daysLeft} días para que termine el curso “{$curso->nombre}”. ¿Deseas renovarlo o reemplazarlo?";
                          }

                          // 5) Enviar email
                          Resend::emails()->send([
                              'from'    => config('mail.from.address'),
                              'to'      => $usuario->email,
                              'subject' => $subject,
                              'html'    => view('emails.course-ending', [
                                  'usuario'  => $usuario,
                                  'curso'    => $curso,
                                  'daysLeft' => $daysLeft,
                              ])->render(),
                          ]);

                          // 6) Actualizar pivot
                          $usuario->pivot->last_notification_sent_at = Carbon::now();
                          $usuario->pivot->save();
                      }
                  });
        }

        $this->info('Recordatorios de cierre de curso enviados a Administrador General y Planeador.');
    }
}
