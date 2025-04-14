import { useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    Search,
    Filter,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/Components/Button";
import { Tabs, TabsList, TabsTrigger } from "@/Components/Tabs";
import InputSearch from "@/Components/InputSearch";
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns";
import { es } from "date-fns/locale";

export default function PrincipalShedule() {
    const [viewType, setViewType] = useState("daily");

    const [currentWeekStart, setCurrentWeekStart] = useState(
        startOfWeek(new Date(), { weekStartsOn: 1 }) // lunes como inicio
    );

    const goToPrevWeek = () => {
        setCurrentWeekStart((prev) => subWeeks(prev, 1));
    };

    const goToNextWeek = () => {
        setCurrentWeekStart((prev) => addWeeks(prev, 1));
    };

    const goToToday = () => {
        setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
    };

    const currentDateRange = `${format(currentWeekStart, "d MMM", {
        locale: es,
    })} - ${format(addWeeks(currentWeekStart, 0.9), "d MMM, yyyy", {
        locale: es,
    })}`;

    const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), {
        weekStartsOn: 1,
    });

    const classrooms = [
        { id: "101", capacity: 38, available: 16 },
        { id: "102", capacity: 35, available: 16 },
        { id: "109", capacity: 35, available: 12 },
        { id: "201", capacity: 38, available: 2 },
        { id: "202", capacity: 35, available: 3 },
    ];

    const scheduleData = [
        {
            room: "201",
            day: "LUNES",
            startTime: "6:00 a.m.",
            code: "T05329",
            name: "Formulación de proyectos",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "201",
            day: "LUNES",
            startTime: "7:00 a.m.",
            code: "T05329",
            name: "Formulación de proyectos",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "201",
            day: "MARTES",
            startTime: "6:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "MARTES",
            startTime: "7:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "MARTES",
            startTime: "8:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "MIÉRCOLES",
            startTime: "6:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "MIÉRCOLES",
            startTime: "7:00 a.m.",
            code: "O3 ad",
            name: "gerencia del cuidado",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "MIÉRCOLES",
            startTime: "8:00 a.m.",
            code: "O3 ad",
            name: "gerencia del cuidado",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "JUEVES",
            startTime: "6:00 a.m.",
            code: "O3 ad",
            name: "gerencia del cuidado",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "201",
            day: "JUEVES",
            startTime: "7:00 a.m.",
            code: "T05829",
            name: "Legislación Ejecutiva",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "201",
            day: "JUEVES",
            startTime: "8:00 a.m.",
            code: "T05829",
            name: "Legislación Ejecutiva",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "201",
            day: "VIERNES",
            startTime: "6:00 a.m.",
            code: "T0551",
            name: "Humanidades I",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "202",
            day: "LUNES",
            startTime: "6:00 a.m.",
            code: "T06174",
            name: "Ética Básica de Admin Salud",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "202",
            day: "LUNES",
            startTime: "7:00 a.m.",
            code: "T06174",
            name: "Ética Básica de Admin Salud",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "202",
            day: "MARTES",
            startTime: "6:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "202",
            day: "MARTES",
            startTime: "7:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "202",
            day: "MARTES",
            startTime: "8:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "202",
            day: "MIÉRCOLES",
            startTime: "6:00 a.m.",
            code: "O3ENF",
            name: "obstetricas complejo",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "109",
            day: "MARTES",
            startTime: "6:00 a.m.",
            code: "O3 ENF",
            name: "ENF major y menor comp",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "109",
            day: "MARTES",
            startTime: "7:00 a.m.",
            code: "O3 ENF",
            name: "ENF major y menor comp",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "109",
            day: "MARTES",
            startTime: "8:00 a.m.",
            code: "O3 ENF",
            name: "ENF major y menor comp",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "109",
            day: "MIÉRCOLES",
            startTime: "6:00 a.m.",
            code: "O3 ENF",
            name: "ENF major y menor comp",
            color: "bg-blue-100 text-blue-800 border-blue-300",
        },
        {
            room: "202",
            day: "JUEVES",
            startTime: "6:00 a.m.",
            code: "T05344",
            name: "Microbiología y Biomecanica Dep",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "202",
            day: "JUEVES",
            startTime: "7:00 a.m.",
            code: "T05344",
            name: "Microbiología y Biomecanica Dep",
            color: "bg-green-100 text-green-800 border-green-300",
        },
        {
            room: "202",
            day: "JUEVES",
            startTime: "8:00 a.m.",
            code: "T05344",
            name: "Microbiología y Biomecanica Dep",
            color: "bg-green-100 text-green-800 border-green-300",
        },
    ];

    const getClassForSlot = (room, day, time) => {
        return scheduleData.find(
            (item) =>
                item.room === room &&
                item.day === day &&
                item.startTime === time
        );
    };

    const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"];
    const timeSlots = ["6:00 a.m.", "7:00 a.m.", "8:00 a.m."];

    return (
        <div className="flex flex-col min-h-screen">
            {/* Filters */}
            <div className="p-2 md:p-4 flex items-center justify-between border-b bg-white flex-wrap gap-2">
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    <div className="flex items-center border rounded-md">
                        <Button
                            variant="ghost"
                            className="flex items-center gap-1 border-r rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto"
                        >
                            <span>Vista diaria</span>
                            <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                        </Button>
                    </div>
                    <div className="relative w-full sm:w-72">
                        <InputSearch placeHolderText="Buscar por aula, curso o profesor..." />
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="flex items-center gap-1 border rounded text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto"
                >
                    <Filter className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
            </div>

            {/* Date Navigation */}
            <div className="p-2 md:px-4 md:pt-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-1 md:gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border rounded p-2"
                        onClick={goToPrevWeek}
                    >
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="border rounded p-2"
                        onClick={goToNextWeek}
                    >
                        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                </div>
                <div className="text-xs md:text-sm font-medium">
                    {currentDateRange}
                </div>
            </div>

            {/* Schedule Table - Responsive Container */}
            <div className="flex-1 overflow-auto p-2 md:px-4 bg-white">
                <div className="bg-white border rounded-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full table-fixed border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th
                                        className="border p-1 md:p-2 font-medium text-xs md:text-sm text-center"
                                        colSpan={3}
                                    >
                                        AULAS
                                    </th>

                                    {days.map((day) => (
                                        <th
                                            key={day}
                                            colSpan={timeSlots.length}
                                            className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm"
                                        >
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                                <tr className="bg-gray-100">
                                    <th className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm">
                                        Aula
                                    </th>
                                    <th className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm">
                                        Cap
                                    </th>
                                    <th className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm">
                                        Disp
                                    </th>
                                    {days.map((day) =>
                                        timeSlots.map((time) => (
                                            <th
                                                key={`${day}-${time}`}
                                                className="border px-1 md:px-2 text-center font-medium text-[10px] md:text-xs w-12 md:w-16"
                                            >
                                                {time}
                                            </th>
                                        ))
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {classrooms.map((classroom, index) => (
                                    <tr
                                        key={classroom.id}
                                        className={
                                            index % 2 === 0
                                                ? "bg-gray-50"
                                                : "bg-white"
                                        }
                                    >
                                        <td className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm">
                                            {classroom.id}
                                        </td>
                                        <td className="border p-1 md:p-2 text-center text-xs md:text-sm">
                                            {classroom.capacity}
                                        </td>
                                        <td className="border p-1 md:p-2 text-center text-xs md:text-sm">
                                            {classroom.available}
                                        </td>
                                        {days.map((day) =>
                                            timeSlots.map((time) => {
                                                const classInfo =
                                                    getClassForSlot(
                                                        classroom.id,
                                                        day,
                                                        time
                                                    );
                                                return (
                                                    <td
                                                        key={`${classroom.id}-${day}-${time}`}
                                                        className="border p-0 text-xs"
                                                    >
                                                        {classInfo && (
                                                            <div
                                                                className={`p-1 h-full ${classInfo.color} border-l-4 flex flex-col`}
                                                            >
                                                                <div className="font-bold text-[10px] md:text-xs">
                                                                    {
                                                                        classInfo.code
                                                                    }
                                                                </div>
                                                                <div className="text-[8px] md:text-xs">
                                                                    {
                                                                        classInfo.name
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                );
                                            })
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="md:hidden p-2 bg-white">
                    <div className="bg-white border rounded-md p-2 mb-2">
                        <h3 className="font-medium text-sm mb-2">
                            Vista Compacta
                        </h3>
                        <select className="w-full border rounded p-1 text-sm mb-2">
                            <option>Seleccionar Aula</option>
                            {classrooms.map((room) => (
                                <option key={room.id} value={room.id}>
                                    Aula {room.id} (Cap: {room.capacity})
                                </option>
                            ))}
                        </select>
                        <select className="w-full border rounded p-1 text-sm">
                            <option>Seleccionar Día</option>
                            {days.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-2 md:p-4 flex items-center justify-between bg-white flex-wrap gap-2">
                    <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1 rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto"
                            >
                                <span>Todos los...</span>
                                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center border rounded-md">
                            <Button
                                variant="ghost"
                                className="flex items-center gap-1 rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto"
                            >
                                <span>Todas las sedes</span>
                                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <Tabs defaultValue="day" className="text-xs md:text-sm">
                            <TabsList>
                                <TabsTrigger
                                    value="day"
                                    className="px-2 py-1 h-auto"
                                >
                                    Día
                                </TabsTrigger>
                                <TabsTrigger
                                    value="week"
                                    className="px-2 py-1 h-auto"
                                >
                                    Semana
                                </TabsTrigger>
                                <TabsTrigger
                                    value="month"
                                    className="px-2 py-1 h-auto"
                                >
                                    Mes
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <Button className="ml-2 text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
                            Actualizar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
