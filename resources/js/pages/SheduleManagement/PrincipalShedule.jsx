import { useState, useEffect, useRef } from "react"
import { LocalizationProvider, DatePicker, PickersDay } from '@mui/x-date-pickers'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, ChevronDown } from "lucide-react"
import { IconButton } from '@mui/material'
import TextField from '@mui/material/TextField'
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek, addDays, isWithinInterval } from "date-fns"
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from "date-fns/locale"
import { getApi } from "@/utils/generalFunctions";

export default function PrincipalSchedule() {
  const [open, setOpen] = useState(false)
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [rawData, setRawData] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sedes, setSedes] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [courses, setCourses] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [formData, setFormData] = useState({ ciudad: "", sede: "", entidad: "", idCurso: "", aula: "", profesional: "" });

  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // weekStartsOn: 1 = Lunes
  );

  const anchorRef = useRef(null);
  const goToPrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Rango de fechas para mostrar en la UI (Lunes a Domingo de la semana actual)
  const currentDateRange = `${format(currentWeekStart, 'd MMM', { locale: es })} - ${format(
    addDays(currentWeekStart, 6), 'd MMM, yyyy', { locale: es }
  )}`;

  // isSameWeek check remains valid for enabling/disabling "Hoy" button
  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  const handleWeekChange = (date) => {
    if (date) {
      const monday = startOfWeek(date, { weekStartsOn: 1 });
      setCurrentWeekStart(monday);
      setOpen(false);
    }
  };

  const convertirHora = hora24 => {
    if (!hora24) return 'Sin hora';
    try {
      // Handle potential seconds or milliseconds in string
      const parts = hora24.split(':');
      const hh = Number(parts[0]);
      const mm = Number(parts[1]);

      if (isNaN(hh) || isNaN(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
        console.warn("Invalid time format or value:", hora24);
        return 'Formato inválido';
      }

      const date = new Date(); // Usar una fecha dummy para construir el objeto Date
      date.setHours(hh, mm, 0, 0);
      return format(date, 'h:mm a', { locale: es }).replace('. m.', '.m.'); // Formato 12 horas con a.m./p.m.
    } catch (error) {
      console.error("Error converting time:", hora24, error);
      return 'Error';
    }
  };

  const colorPalette = [
    { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
    { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
    { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
    { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
    { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
    { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
    { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  ];

  const filteredEntidades = formData.ciudad
    ? entidades.filter(ent =>
      sedes.some(s => s.idEntidadPropietaria === ent.idEntidad && s.idCiudad === Number(formData.ciudad))
    )
    : entidades;

  const filteredSedes = formData.entidad
    ? sedes.filter(s =>
      s.idEntidadPropietaria === Number(formData.entidad) &&
      (!formData.ciudad || s.idCiudad === Number(formData.ciudad))
    )
    : formData.ciudad
      ? sedes.filter(s => s.idCiudad === Number(formData.ciudad))
      : sedes;

  const filteredAulas = formData.sede
    ? aulas.filter(a => a.idSede === Number(formData.sede))
    : [];

  const availableCourseIds = formData.aula
    ? new Set(
      rawData
        .filter(item => item.idAula === Number(formData.aula))
        .map(item => item.idCurso)
    )
    : formData.sede
      ? new Set(
        rawData
          .filter(item => item.aula.sede.idSede === Number(formData.sede))
          .map(item => item.idCurso)
      )
      : null;

  const filteredCourses = availableCourseIds
    ? courses.filter(c => availableCourseIds.has(c.idCurso))
    : courses;

  const aulaColorMap = useRef(new Map());
  const colorIndex = useRef(0);

  const getColorForRoom = room => {
    if (aulaColorMap.current.has(room)) return aulaColorMap.current.get(room);
    const color = colorPalette[colorIndex.current % colorPalette.length];
    aulaColorMap.current.set(room, color);
    colorIndex.current++;
    return color;
  };

  // Transform and filter rawData based on current week whenever rawData or currentWeekStart changes
  useEffect(() => {
    const weekStart = currentWeekStart;
    const weekEnd = addDays(weekStart, 6); // Domingo de la semana actual

    const filtered = rawData.filter(item => {
      // Convertir fechas a objetos Date. Si son null, asumimos que siempre están activos.
      // Adjusting date parsing for potential timezone issues if needed, but sticking to current logic
      const startDate = item.fecha_inicio ? new Date(item.fecha_inicio + 'T00:00:00') : null; // Assume YYYY-MM-DD format
      const endDate = item.fecha_fin ? new Date(item.fecha_fin + 'T00:00:00') : null; // Assume YYYY-MM-DD format

      // Adjust endDate to end of day local time
      const endDateEndOfDay = endDate ? new Date(endDate) : null;
      if (endDateEndOfDay) endDateEndOfDay.setHours(23, 59, 59, 999);


      // Check if the item's date range overlaps with the current week
      // Item starts before or during the week AND Item ends after or during the week
      const startsOnOrBeforeWeekEnd = !startDate || startDate <= weekEnd;
      const endsOnOrAfterWeekStart = !endDateEndOfDay || endDateEndOfDay >= weekStart;

      return startsOnOrBeforeWeekEnd && endsOnOrAfterWeekStart;
    });

    // Reset color map when rawData or week changes to re-assign colors
    aulaColorMap.current = new Map();
    colorIndex.current = 0;

    const transformed = filtered.flatMap(item => {
      // Asegurarse de que item.dias es un array antes de intentar map
      if (!Array.isArray(item.dias)) {
        console.warn("Item missing dias array:", item);
        return []; // Saltar este item si no tiene dias válidos
      }

      return item.dias.map(diaObj => {
        // Asegurarse de que diaObj y diaObj.pivot existen y que item.curso y item.aula existen
        if (!diaObj || !diaObj.pivot || !item.curso || !item.aula) {
          // console.warn("Missing dia object, pivot, curso, or aula data for item:", item);
          return null; // Omitir este día si falta data crítica
        }

        const { hora_inicio, hora_fin } = diaObj.pivot;
        // Ensure times are in HH:mm format if they come differently (e.g., HH:mm:ss)
        const startTimeFormatted = hora_inicio ? hora_inicio.substring(0, 5) : null;
        const endTimeFormatted = hora_fin ? hora_fin.substring(0, 5) : null;


        const startTime = convertirHora(startTimeFormatted);
        const endTime = convertirHora(endTimeFormatted);
        const color = getColorForRoom(item.aula?.codigo || 'Sin aula');

        // Build time blocks (Assuming blocks are hourly from the start hour)
        const blocks = [];
        if (startTimeFormatted && endTimeFormatted) {
          try {
            const [sh, sm] = startTimeFormatted.split(':').map(Number);
            const [eh, em] = endTimeFormatted.split(':').map(Number);

            if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em) && sh >= 0 && sh <= 23 && eh >= 0 && eh <= 23) {

              // Add block for the start hour if minutes > 0 to catch partial start times
              if (sm > 0 && sh < 24) { // Ensure hour is valid before processing
                const period = sh < 12 ? 'a.m.' : 'p.m.';
                const displayHour = sh % 12 === 0 ? 12 : sh % 12;
                // Use the standard block format for display matching timeSlots
                // Blocks should probably represent the *start* of an occupied hour slot.
                // If a class is 14:30-15:30, it occupies the 14:00 slot (partially) and the 15:00 slot (partially).
                // Let's refine this: Mark *every* hour block the class *spans across*.
                let currentHour = sh;
                const endHourAdjusted = em > 0 ? eh + 1 : eh; // If ends at 15:30, it occupies the 15:00 slot

                while (currentHour < endHourAdjusted && currentHour < 24) {
                  const period = currentHour < 12 || currentHour === 24 ? 'a.m.' : 'p.m.';
                  const displayHour = currentHour % 12 === 0 ? 12 : currentHour % 12;
                  blocks.push(`${displayHour}:00 ${period}`);
                  currentHour++;
                }

                // Remove duplicates if any from this logic
                const uniqueBlocks = [...new Set(blocks)];
                blocks.length = 0; // Clear blocks
                blocks.push(...uniqueBlocks); // Add unique blocks back


              } else {
                // Original logic for clean hour starts
                // Iterate from start hour up to (but not including) end hour
                let currentHour = sh;
                // End hour is included *if* it's exactly on the hour or has minutes
                const adjustedEndHour = em === 0 && sh !== eh ? eh - 1 : eh; // If ends exactly at 15:00 and started before 15:00, the last block is 14:00. If ends at 15:30, last block is 15:00. If starts and ends same hour 14:00-14:30, block is 14:00. If 14:00-15:00, block 14:00.
                const finalEndHour = em > 0 || sh === eh ? eh : eh - 1; // If ends at hh:mm with mm > 0, or starts/ends in same hour, include the end hour block. Otherwise end at the previous hour block. This is tricky.

                // Let's simplify: A class from SH:SM to EH:EM occupies all hourly slots H:00 where H >= SH and H < EH, plus the EH:00 slot if EM > 0 or EH=SH.
                // A simpler rule for display: A class at SH:SM ending at EH:EM covers all hourly slots from SH:00 up to, but *not including* EH:00, PLUS EH:00 if EM > 0. If EH=SH and EM>0, it covers SH:00.
                // Example: 14:00-15:00 -> 14:00 block. 14:30-15:30 -> 14:00, 15:00 blocks. 14:00-14:30 -> 14:00 block. 14:00-16:00 -> 14:00, 15:00 blocks. 14:00-16:30 -> 14:00, 15:00, 16:00 blocks.

                let hourBlock = sh;
                while (hourBlock <= eh && hourBlock < 24) { // Iterate from start hour up to end hour block
                  if (hourBlock === eh && em === 0 && sh !== eh) {
                    // If it ends *exactly* on the hour (and isn't a single hour slot like 14:00-15:00)
                    // then the EH:00 slot isn't the *start* of a block it fully occupies.
                    // The loop condition `hourBlock <= eh` is slightly off if ending exactly on the hour.
                    // Let's use '<' and potentially add the last block if needed.
                    break; // Exit if we reached the end hour and minutes are 0 (covered by previous hour block)
                  }
                  const period = hourBlock < 12 || hourBlock === 24 ? 'a.m.' : 'p.m.';
                  const displayHour = hourBlock % 12 === 0 ? 12 : hourBlock % 12;
                  blocks.push(`${displayHour}:00 ${period}`);
                  hourBlock++;
                }

                // Correction for exact hour end: A class 14:00-15:00 only occupies the 14:00 block.
                // If end minute is 0 and start hour is not the same as end hour, stop *before* end hour.
                // If end minute is > 0, or start hour is same as end hour (e.g., 14:00-14:30), include end hour.
                blocks.length = 0; // Clear blocks from previous loop
                let h = sh;
                const lastHourBlock = (em > 0 || sh === eh) ? eh : eh - 1;

                while (h <= lastHourBlock && h < 24) {
                  const period = h < 12 ? 'a.m.' : 'p.m.';
                  const displayHour = h % 12 === 0 ? 12 : h % 12;
                  blocks.push(`${displayHour}:00 ${period}`);
                  h++;
                }


              }
            } else {
              console.warn("Invalid time numbers for item:", item);
            }

          } catch (timeParseError) {
            console.error("Error parsing times for blocks:", startTimeFormatted, endTimeFormatted, timeParseError);
          }
        }


        // Map day names from API to the required format ('LUNES', 'MARTES', etc.)
        const dayName = diaObj.nombre?.toUpperCase() || 'SIN DÍA';
        const normalizedDayName = days.find(d => d === dayName) || 'SIN DÍA'; // Ensure day name is one of the valid days

        return {
          room: item.aula.codigo || 'Sin aula',
          day: normalizedDayName, // Usar el nombre normalizado
          startTime,
          endTime,
          code: item.curso.codigo || 'Sin código', // Access course code
          name: item.curso.nombre || 'Sin nombre', // Access course name
          color: `${color.bg} ${color.text} ${color.border}`,
          timeBlocks: blocks,
        };
      }).filter(item => item !== null); // Remove any null items resulting from validation failures
    }).filter(item => item.day !== 'SIN DÍA'); // Filter out items with invalid days

    setScheduleData(transformed);
  }, [rawData, currentWeekStart, es]); // Depende de rawData, la semana actual, y locale

  const days = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  // Generar slots de tiempo de 6 a 20 (8pm)
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 6 + i; // Hours 6, 7, ..., 20
    // Handle 12-hour format display
    const period = hour < 12 || hour === 24 ? 'a.m.' : 'p.m.'; // 24:00 is midnight, usually shown as 12 a.m.
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour; // 0:00 becomes 12, >12 becomes hour-12

    return `${displayHour}:00 ${period}`;
  });


  // Función para obtener las clases que caen en un slot de tiempo y día específicos
  const getClassForSlot = (time, day) => {
    return scheduleData.filter(item => item.day === day && item.timeBlocks.includes(time));
  }

  const api = getApi(); // Asumiendo que getApi está definido y devuelve tu instancia de axios/api

  async function fetchData(filter = {}) {
    setLoading(true);
    try {
      let endpoint = '/Horario';
      const params = new URLSearchParams();

      // Build search parameters based on the current filter object
      if (filter.ciudad_id) params.append('ciudad_id', filter.ciudad_id);
      if (filter.entidad_id) params.append('entidad_id', filter.entidad_id);
      if (filter.aula_sede) params.append('aula_sede', filter.aula_sede);
      if (filter.idCurso) params.append('idCurso', filter.idCurso);
      if (filter.profesional_codigo) params.append('profesional_codigo', filter.profesional_codigo);
      // Removed the generic filter/searchValue logic

      if (params.toString()) endpoint = `/Horario/search?${params.toString()}`;

      const response = await api.get(endpoint);
      let raw = [];
      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response.data)) {
        raw = response.data;
      } else if (Array.isArray(response.data.data)) {
        raw = response.data.data;
      } else if (Array.isArray(response.data.data?.data)) {
        raw = response.data.data.data;
      } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
        // If the backend /search endpoint returns a single item object when only one result
        // Wrap it in an array to maintain consistent data structure.
        raw = [response.data];
      }


      // Asegurarse de que raw es un array, si no, lanzar error o establecer a []
      if (!Array.isArray(raw)) {
        console.error("API did not return an array for Horario:", response.data);
        raw = []; // Establecer a array vacío para evitar errores
      }

      setRawData(raw); // Guardar los datos crudos
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setRawData([]); // En caso de error, limpiar datos crudos
    } finally {
      setLoading(false);
    }
  }

  // Cargar datos iniciales (horarios, sedes, ciudades, entidades, courses) al montar el componente
  useEffect(() => {
    fetchData();
    api.get('/aula').then(res => setAulas(res.data)).catch(err => console.error("Error fetching aulas:", err));
    api.get('/sede').then(res => setSedes(res.data)).catch(err => console.error("Error fetching sedes:", err));
    api.get('/ciudad').then(res => setCiudades(res.data)).catch(err => console.error("Error fetching ciudades:", err));
    api.get('/entidad').then(res => setEntidades(res.data)).catch(err => console.error("Error fetching entidades:", err));
    api.get('/profesional').then(res => setProfessionals(res.data)).catch(err => console.error("Error fetching profesionales:", err));
    api.get('/curso').then(res => setCourses(res.data)).catch(err => console.error("Error fetching courses:", err));
  }, []);

  // Manejar cambios en los inputs de filtro
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'profesional') {
      setFormData({ ciudad: '', entidad: '', sede: '', aula: '', idCurso: '', profesional: value });
      fetchData({ profesional_codigo: value });
      return;
    }
    const newForm = { ...formData, [name]: value };
    if (name === 'ciudad') {
      newForm.entidad = '';
      newForm.sede = '';
      newForm.aula = '';
      newForm.idCurso = '';
    }
    if (name === 'entidad') {
      newForm.sede = '';
      newForm.aula = '';
      newForm.idCurso = '';
    }
    if (name === 'sede') {
      newForm.aula = '';
      newForm.idCurso = '';
    }
    if (name === 'aula') {
      newForm.idCurso = '';
    }
    setFormData(newForm);
    const params = {};
    if (newForm.ciudad) params.ciudad_id = newForm.ciudad;
    if (newForm.entidad) params.entidad_id = newForm.entidad;
    if (newForm.sede) params.aula_sede = newForm.sede;
    if (newForm.aula) params.idAula = newForm.aula;
    if (newForm.idCurso) params.idCurso = newForm.idCurso;
    if (Object.keys(params).length) fetchData(params);
    else fetchData();
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Date Navigation - kept the original structure */}
      <div className="p-2 md:px-4 md:pt-4 flex items-center justify-between bg-white flex-wrap gap-2">
        {/* Espacio para posibles botones/filtros arriba del todo si se necesitan */}
      </div>

      {/* Date Navigation and "Today" Button */}
      <div className="p-2 md:px-4 md:pt-2 flex items-center justify-center bg-white gap-4">
        <button
          onClick={goToPrevWeek}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="Semana anterior"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="text-sm md:text-base font-medium text-gray-700">{currentDateRange}</div>
          {/* Botón "Hoy" */}
          <button
            onClick={goToToday}
            // Deshabilitar si ya estamos en la semana actual
            disabled={isCurrentWeek}
            className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Ir a la semana actual"
          >
            Hoy
          </button>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            {/* SOLO EL ICONO */}
            <IconButton
              onClick={() => setOpen(true)}
              size="small"
              aria-label="Seleccionar semana"
              className="ml-2"
            >
              <CalendarIcon />
            </IconButton>

            <div className="hidden">
              <DatePicker
                open={open}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                value={currentWeekStart}
                onChange={handleWeekChange}
                // deshabilita todo menos los lunes
                shouldDisableDate={(day) => day.getDay() !== 1}
                // resalta la semana completa
                renderDay={(day, _value, DayComponentProps) => {
                  const weekEnd = addDays(weekStart, 6);
                  const isInWeek = isWithinInterval(day, { start: weekStart, end: weekEnd });
                  return (
                    <PickersDay
                      {...DayComponentProps}
                      sx={{
                        ...(isInWeek && {
                          bgcolor: 'primary.light',
                          color: 'primary.contrastText',
                          '&:hover, &:focus': {
                            bgcolor: 'primary.main',
                          },
                        }),
                      }}
                    />
                  );
                }}
                // NO PINTA NINGÚN INPUT
                renderInput={() => null}
                PopperProps={
                  {
                    anchorEl: anchorRef.current,
                    placement: 'bottom-start',
                    disablePortal: true,
                    modifiers: [
                      { name: 'offset', options: { offset: [0, 8] } },
                      { name: 'preventOverflow', options: { altAxis: true } },
                      { name: 'flip', options: { fallbackPlacements: [] } }
                    ]
                  }
                }
              />
            </div>
          </LocalizationProvider>
        </div>
        <button
          onClick={goToNextWeek}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="Semana siguiente"
        // No deshabilitamos "Siguiente semana" por defecto
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Schedule Table */}
      <div className="flex-1 overflow-hidden p-2 md:px-4 bg-white"> {/* Changed overflow-auto to overflow-hidden here */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <p className="text-gray-700 text-lg">Cargando horario...</p>
          </div>
        )}
        <div className="bg-white border rounded-md overflow-hidden">
          {/* Added h-96 to parent div instead of table wrapper for better control */}
          <div className="overflow-x-auto relative" style={{ maxHeight: 'calc(100vh - 350px)' }}> {/* Altura ajustada, puedes modificar 350px */}
            <table className="w-full table-fixed border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 sticky top-0 z-[1]"> {/* Made header sticky */}
                  <th className="border p-1 md:p-2 font-medium text-xs md:text-sm text-center bg-gray-50" style={{ width: '100px' }} rowSpan={2}>
                    HORAS
                  </th>
                  {days.map((day) => (
                    <th key={day} className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm bg-gray-50">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="bg-white">
                    <td className="border p-1 md:p-2 text-center font-medium text-xs md:text-sm sticky left-0 bg-white z-[1]">{time}</td> {/* Made time sticky */}
                    {days.map((day) => {
                      const classesInfo = getClassForSlot(time, day);
                      return (
                        <td key={`${day}-${time}`} className="border p-0 text-xs align-top"> {/* Align top to prevent content centering */}
                          <div className="flex flex-col gap-1 p-1">
                            {classesInfo.map((classInfo, idx) => (
                              // Added block class to make it take full width if only one item
                              <div key={idx} className={`p-1 block ${classInfo.color} border-l-4 flex flex-col`}>
                                <div className="font-bold text-[10px] md:text-[12px] whitespace-normal break-words"> {/* Allow text wrap */}
                                  {classInfo.code} (Aula {classInfo.room})
                                </div>
                                <div className="text-[8px] md:text-[10px] whitespace-normal break-words">{classInfo.name}</div> {/* Allow text wrap */}
                                {/* Opcional: Mostrar horas exactas de inicio/fin dentro de la celda */}
                                {/* Add a span around time to prevent text overflow if needed */}
                                {/* <div className="text-[7px] md:text-[9px] text-gray-600 whitespace-normal break-words">{classInfo.startTime} - {classInfo.endTime}</div> */}
                              </div>
                            ))}
                            {/* Rellenar espacio si no hay clases para mantener altura */}
                            {/* Add a minimal height or padding instead of an invisible dot */}
                            {classesInfo.length === 0 && (
                              <div className="min-h-[1.5rem]"></div> // Use min-height for empty cells
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Si no hay datos después de cargar */}
                {/* Improve empty state messages */}
                {!loading && rawData.length === 0 && ( // No raw data means no data at all or filters returned nothing
                  <tr>
                    <td colSpan={days.length + 1} className="text-center py-8 text-gray-600 text-base">
                      {
                        // Check if any filter is currently applied
                        formData.ciudad || formData.sede || formData.entidad || formData.idCurso
                          ? 'No se encontraron horarios que coincidan con los filtros aplicados para esta semana.'
                          : 'No hay datos de horarios disponibles.'
                      }
                    </td>
                  </tr>
                )}
                {/* Optional: Message if rawData exists but no schedules fall into *this week* */}
                {/* You could add this by checking rawData.length > 0 && scheduleData.length === 0, but the above covers most cases */}

              </tbody>
            </table>
          </div>
        </div>

        {/* Filters below table */}
        <div className="p-2 md:p-4 flex items-center justify-start bg-white flex-wrap gap-4 mt-7"> {/* Adjusted justify-between to justify-start and increased gap */}
          <div className="flex items-end gap-4 md:gap-5 flex-wrap"> {/* Align items to the bottom and potentially closer gaps */}
            {/* <div className="flex items-center border rounded-md">
              <Button variant="ghost" className="flex items-center gap-1 rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
                <span>Todos los...</span>
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                </div> */}
            {/* Ciudad Filter */}
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="ciudad" value="Ciudad" className="text-sm" />
              <SelectInput
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                options={[{ value: '', label: 'Todas las Ciudades' }, ...ciudades.map(c => ({ value: c.idCiudad, label: c.nombre }))]}
              />
            </div>
            {/* Entidad Filter */}
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="entidad" value="Entidad" className="text-sm" />
              <SelectInput
                id="entidad"
                name="entidad"
                value={formData.entidad}
                onChange={handleChange}
                options={[{ value: '', label: 'Todas las Entidades' }, ...filteredEntidades.map(e => ({ value: e.idEntidad, label: e.nombre }))]}
              />
            </div>
            {/* Sede Filter */}
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="sede" value="Sede" className="text-sm" />
              <SelectInput
                id="sede"
                name="sede"
                value={formData.sede}
                onChange={handleChange}
                options={[{ value: '', label: 'Todas las Sedes' }, ...filteredSedes.map(s => ({ value: s.idSede, label: s.nombre }))]}
              />
            </div>
            {/* Aula Filter */}
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="sede" value="Aula" className="text-sm" />
              <SelectInput id="aula" name="aula" value={formData.aula} onChange={handleChange}
                options={[{ value: '', label: 'Todas las Aulas' }, ...filteredAulas.map(a => ({ value: a.idAula, label: a.codigo }))]} />
            </div>
            {/* NEW: Curso Filter - Using structure similar to ClassForm */}
            <div className="space-y-2 min-w-[200px]"> {/* Adjusted min-width slightly */}
              <InputLabel htmlFor="idCurso" value="Curso (Código)" className="text-sm" />
              <SelectInput
                id="idCurso"
                name="idCurso"
                value={formData.idCurso}
                onChange={handleChange}
                options={[{ value: '', label: 'Todos los Cursos' }, ...filteredCourses.map(c => ({ value: c.idCurso, label: c.codigoGrupo }))]}
              />
            </div>
            {/* Profesional Filter */}
            <div className="space-y-2 min-w-[200px]">
              <InputLabel htmlFor="profesional" value="Profesional (Código)" className="text-sm" />
              <SelectInput
                id="profesional"
                name="profesional"
                value={formData.profesional}
                onChange={handleChange}
                options={[{ value: '', label: 'Todos los Profesionales' }, ...professionals.map(p => ({ value: p.codigo, label: `${p.codigo} – ${p.nombreCompleto}` }))]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
