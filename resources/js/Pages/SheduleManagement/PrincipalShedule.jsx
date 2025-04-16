"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/Components/Button"
import { Tabs, TabsList, TabsTrigger } from "@/Components/Tabs"
import InputSearch from "@/Components/InputSearch"
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek } from "date-fns"
import { es } from "date-fns/locale"

export default function PrincipalShedule() {
  const [viewType, setViewType] = useState("daily")

  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }), // lunes como inicio
  )

  const goToPrevWeek = () => {
    setCurrentWeekStart((prev) => subWeeks(prev, 1))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart((prev) => addWeeks(prev, 1))
  }

  const goToToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const currentDateRange = `${format(currentWeekStart, "d MMM", {
    locale: es,
  })} - ${format(addWeeks(currentWeekStart, 0.9), "d MMM, yyyy", {
    locale: es,
  })}`

  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), {
    weekStartsOn: 1,
  })

  const classrooms = [
    { id: "101", capacity: 38, available: 16 },
    { id: "102", capacity: 35, available: 16 },
    { id: "109", capacity: 35, available: 12 },
    { id: "201", capacity: 38, available: 2 },
    { id: "202", capacity: 35, available: 3 },
  ]

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
  ]
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 20; hour++) {
      const period = hour < 12 ? "a.m." : "p.m."
      const displayHour = hour % 12 === 0 ? 12 : hour % 12
      slots.push(`${displayHour}:00 ${period}`)
    }
    return slots
  }

  const getClassForSlot = (time, day) => {
    return scheduleData.filter((item) => item.day === day && item.startTime === time)
  }

  const days = ["LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES"]
  const timeSlots = generateTimeSlots()

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

      {/* Schedule Table - Responsive Container */}
      <div className="flex-1 overflow-auto p-2 md:px-4 bg-white">
        <div className="bg-white border rounded-md overflow-hidden">
          <div className="overflow-x-auto h-96 overflow-y-auto">
            <table className="w-full table-fixed border-collapse min-w-[1200px] ">
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
                      const classesInfo = getClassForSlot(time, day)
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
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* <div className="md:hidden p-2 bg-white">
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
                </div> */}

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
          
        </div>
      </div>
    </div>
  )
}
