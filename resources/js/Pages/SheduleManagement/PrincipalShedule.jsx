import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Calendar, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/Components/Button"
import InputSearch from "@/Components/InputSearch"
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns"
import { es } from "date-fns/locale"
import { getApi } from "@/utils/generalFunctions";

export default function PrincipalShedule() {
  const [viewType, setViewType] = useState("daily")
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const goToPrevWeek = () => setCurrentWeekStart((prev) => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart((prev) => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const currentDateRange = `${format(currentWeekStart, "d MMM", {
    locale: es,
  })} - ${format(addWeeks(currentWeekStart, 0.9), "d MMM, yyyy", {
    locale: es,
  })}`;

  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), {
    weekStartsOn: 1,
  });

  const convertirHora = (hora24) => {
    if (!hora24) return "Sin hora";
    const [hh, mm] = hora24.split(":");
    const h = parseInt(hh);
    const ampm = h >= 12 ? "p.m." : "a.m.";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12}:${mm} ${ampm}`;
  };

  const colorPalette = [
    { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
    { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
    { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
    { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
    { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-300" },
    { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
    { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300" },
    { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  ];

  const aulaColorMap = new Map();
  let colorIndex = 0;

  function getColorForRoom(room) {
    if (aulaColorMap.has(room)) {
      return aulaColorMap.get(room);
    }

    const color = colorPalette[colorIndex % colorPalette.length];
    aulaColorMap.set(room, color);
    colorIndex++;
    return color;
  }

  const transformScheduleData = (horarios) => {
    return horarios.map((item) => {
      const startTime = convertirHora(item.franja_horaria?.horaInicio);
      const endTime = convertirHora(item.franja_horaria?.horaFin);
      const color = getColorForRoom(item.aula?.codigo || "Sin aula");

      // Calcular bloques de tiempo que ocupa la clase
      const blocks = [];
      if (item.franja_horaria?.horaInicio && item.franja_horaria?.horaFin) {
        const [sh, sm] = item.franja_horaria.horaInicio.split(":").map(Number);
        const [eh, em] = item.franja_horaria.horaFin.split(":").map(Number);

        for (let h = sh; h <= eh; h++) {
          const period = h < 12 ? "a.m." : "p.m.";
          const displayHour = h % 12 === 0 ? 12 : h % 12;
          blocks.push(`${displayHour}:00 ${period}`);
        }
      }

      return {
        room: item.aula?.codigo || "Sin aula",
        day: item.dia?.toUpperCase() || "SIN DÍA",
        startTime,
        endTime,
        code: item.curso?.codigo || "Sin código",
        name: item.curso?.nombre || "Sin nombre",
        color: `${color.bg} ${color.text} ${color.border}`,
        timeBlocks: blocks,
      };
    });
  };


  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 20; hour++) {
      const period = hour < 12 ? "a.m." : "p.m.";
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      slots.push(`${displayHour}:00 ${period}`);
    }
    return slots;
  };

  const getClassForSlot = (time, day) => {
    return scheduleData.filter((item) => {
      return item.day === day && item.timeBlocks.includes(time);
    });
  };

  const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
  const timeSlots = generateTimeSlots();

  const api = getApi();

  async function fetchData() {
    try {
      const response = await api.get("/Horario");
      const transformed = transformScheduleData(response.data);
      setScheduleData(transformed);
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Filters */}
      <div className="p-2 md:p-4 flex items-center justify-between border-b bg-white flex-wrap gap-2">
        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
          <Calendar className="h-3 w-3 md:h-4 md:w-4" />
          <div className="flex items-center border rounded-md">
            <Button variant="ghost" className="flex items-center gap-1 border-r rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
              <span>Vista diaria</span>
              <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>
          <div className="relative w-full sm:w-72">
            <InputSearch placeHolderText="Buscar por aula, curso o profesor..." />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="flex items-center gap-1 border rounded text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
          <Filter className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      {/* Date Navigation */}
      <div className="p-2 md:px-4 md:pt-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1 md:gap-2">
          <Button variant="ghost" size="icon" className="border rounded p-2" onClick={goToPrevWeek}>
            <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <Button
            variant="ghost"
            className="font-medium text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto border rounded"
            onClick={goToToday}
            disabled={isCurrentWeek}
          >
            Hoy
          </Button>
          <Button variant="ghost" size="icon" className="border rounded p-2" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
        <div className="text-xs md:text-sm font-medium">{currentDateRange}</div>
      </div>

      {/* Schedule Table */}
      <div className="flex-1 overflow-auto p-2 md:px-4 bg-white">
        <div className="bg-white border rounded-md overflow-hidden">
          <div className="overflow-x-auto h-96 overflow-y-auto">
            <table className="w-full table-fixed border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border p-1 md:p-2 font-medium text-xs md:text-sm text-center" rowSpan={2}>
                    HORAS
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="bg-white">
                    <td className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm">{time}</td>
                    {days.map((day) => {
                      const classesInfo = getClassForSlot(time, day);
                      return (
                        <td key={`${day}-${time}`} className="border p-0 text-xs">
                          <div className="flex flex-col gap-1 p-1">
                            {classesInfo.map((classInfo, idx) => (
                              <div key={idx} className={`p-1 flex-grow ${classInfo.color} border-l-4 flex flex-col`}>
                                <div className="font-bold text-[10px] md:text-[12px]">
                                  {classInfo.code} (Aula {classInfo.room})
                                </div>
                                <div className="text-[8px] md:text-[10px]">{classInfo.name}</div>
                              </div>
                            ))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters abajo */}
        <div className="p-2 md:p-4 flex items-center justify-between bg-white flex-wrap gap-2">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" className="flex items-center gap-1 rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
                <span>Todos los...</span>
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" className="flex items-center gap-1 rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
                <span>Todas las sedes</span>
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
