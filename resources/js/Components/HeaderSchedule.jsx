import { ChevronLeft, Printer, Download } from "lucide-react";
import { Button } from "@/Components/Button";
import { router } from "@inertiajs/react";

export default function HeaderSchedule({ title = "Cronograma de Horarios", backTo = null }) {
  return (
    <header className="border-b p-2 md:p-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-1 md:gap-2">
        {backTo && (
          <Button
            variant="ghost"
            size="icon"
            className="hidden sm:flex"
            onClick={() => router.visit(backTo)}
          >
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        )}
        <h1 className="text-base md:text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-xs md:text-sm"
        >
          <Printer className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Imprimir</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-1 text-xs md:text-sm"
        >
          <Download className="h-4 w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>
      </div>
    </header>
  );
}
