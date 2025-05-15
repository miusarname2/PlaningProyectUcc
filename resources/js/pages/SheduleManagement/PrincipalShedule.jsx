import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Calendar, Filter, ChevronDown } from "lucide-react"
import { Button } from "@/Components/Button"
import InputSearch from "@/Components/InputSearch"
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek,addDays } from "date-fns"
import { es } from "date-fns/locale"
import { getApi } from "@/utils/generalFunctions";

export default function PrincipalSchedule() {
  const [rawData, setRawData] = useState([]); // Guarda los datos crudos de la API
  const [scheduleData, setScheduleData] = useState([]); // Datos transformados y filtrados por semana
  const [loading, setLoading] = useState(true);
  const [sedes, setSedes] = useState([]);
  const [entidades, setEntidades] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [formData, setFormData] = useState({ sede: "", ciudad: "", entidad: "", filtro: "", searchValue: "" });

  const filtrosDisponibles = [
    { value: "curso_codigo", label: "Codigo del curso" },
    { value: "curso_nombre", label: "Nombre del curso" },
    { value: "profesional_codigo", label: "Codigo del profesional" }
  ];

  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // weekStartsOn: 1 = Lunes
  );

  const goToPrevWeek = () => setCurrentWeekStart(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeekStart(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Rango de fechas para mostrar en la UI (Lunes a Domingo de la semana actual)
  const currentDateRange = `${format(currentWeekStart, 'd MMM', { locale: es })} - ${format(
    addDays(currentWeekStart, 6), 'd MMM, yyyy', { locale: es }
  )}`;

  const isCurrentWeek = isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 });

  const convertirHora = hora24 => {
    if (!hora24) return 'Sin hora';
    try {
      const [hh, mm] = hora24.split(':').map(Number);
      if (isNaN(hh) || isNaN(mm)) return 'Formato inválido'; // Validación básica
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
        const startDate = item.fecha_inicio ? new Date(item.fecha_inicio) : null;
        const endDate = item.fecha_fin ? new Date(item.fecha_fin) : null;

        // Ajustar endDate al final del día para que incluya ese día completo
        const endDateEndOfDay = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

        // El horario es relevante para esta semana si:
        // 1. No tiene fecha de fin O su fecha de fin es >= al Lunes de esta semana.
        // AND
        // 2. No tiene fecha de inicio O su fecha de inicio es <= al Domingo de esta semana.
        const isActiveDuringWeek =
            (!endDateEndOfDay || endDateEndOfDay >= weekStart) &&
            (!startDate || startDate <= weekEnd);

        return isActiveDuringWeek;
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
        // Asegurarse de que diaObj y diaObj.pivot existen
        if (!diaObj || !diaObj.pivot) {
            console.warn("Dia object or pivot missing:", diaObj);
            return null; // Omitir este día
        }

        const { hora_inicio, hora_fin } = diaObj.pivot;
        const startTime = convertirHora(hora_inicio);
        const endTime = convertirHora(hora_fin);
        const color = getColorForRoom(item.aula?.codigo || 'Sin aula');

        // Build time blocks (Assuming blocks are hourly from the start hour)
        const blocks = [];
        if (hora_inicio && hora_fin) {
          const [sh, sm] = hora_inicio.split(':').map(Number);
          const [eh, em] = hora_fin.split(':').map(Number);

           // Ensure hours are valid numbers
          if (!isNaN(sh) && !isNaN(eh)) {
             // Iterate from start hour up to (but not including) end hour
             // This is a common way to represent blocks occupied.
             // If a class is 14:00 to 15:00, it occupies the 14:00 block.
             // If it's 14:30 to 15:30, it might occupy 14:00 and 15:00 blocks depending on granularity.
             // The current implementation adds all full hours between start and end. Let's stick to that.
            for (let h = sh; h <= eh; h++) { // Includes the end hour block if the time falls on the hour
              const period = h < 12 ? 'a.m.' : 'p.m.';
              const displayHour = h % 12 === 0 ? 12 : h % 12;
              blocks.push(`${displayHour}:00 ${period}`);
            }
          }
        }

        // Map day names from API to the required format ('LUNES', 'MARTES', etc.)
        const dayName = diaObj.nombre?.toUpperCase() || 'SIN DÍA';
        const normalizedDayName = days.find(d => d === dayName) || 'SIN DÍA'; // Ensure day name is one of the valid days

        return {
          room: item.aula?.codigo || 'Sin aula',
          day: normalizedDayName, // Usar el nombre normalizado
          startTime,
          endTime,
          code: item.curso?.codigo || 'Sin código',
          name: item.curso?.nombre || 'Sin nombre',
          color: `${color.bg} ${color.text} ${color.border}`,
          timeBlocks: blocks,
        };
      }).filter(item => item !== null); // Remove any null items resulting from validation failures
    }).filter(item => item.day !== 'SIN DÍA'); // Filter out items with invalid days

    setScheduleData(transformed);
  }, [rawData, currentWeekStart]); // Depende de rawData y la semana actual

  const days = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
  // Generar slots de tiempo de 6 a 20 (8pm)
  const timeSlots = Array.from({ length: 15 }, (_, i) => {
    const hour = 6 + i;
    const period = hour < 12 || hour === 24 ? 'a.m.' : 'p.m.'; // 24:00 is midnight, usually shown as 12 a.m.
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
     return `${displayHour}:00 ${period}`;
  });


  // Función para obtener las clases que caen en un slot de tiempo y día específicos
  const getClassForSlot = (time, day) => {
    // Nota: Esta función asume que timeBlocks contiene el slot exacto.
    // Si timeBlocks solo tiene las horas completas (como en la lógica actual),
    // una clase que va de 14:30 a 15:30 se mostraría en el slot 2 p.m. (14:00).
    // Si necesitas mayor granularidad (ej: 14:30), timeSlots y timeBlocks
    // deberían ser más detallados (ej: '2:00 p.m.', '2:30 p.m.', etc.).
    return scheduleData.filter(item => item.day === day && item.timeBlocks.includes(time));
  }


  const api = getApi(); // Asumiendo que getApi está definido y devuelve tu instancia de axios/api

  // Función para cargar los datos del horario desde la API
  // Ahora solo carga los datos crudos, el filtrado por fecha se hace en el useEffect
  async function fetchData(filterKey = null, filterValue = null) {
    setLoading(true);
    try {
      let endpoint = '/Horario';
      if (filterKey && filterValue !== null && filterValue !== "") { // Añadir chequeo para valor vacío
          endpoint = `/Horario/search?${filterKey}=${filterValue}`;
      }
      const response = await api.get(endpoint);
      let raw = [];
      // Manejar diferentes estructuras de respuesta
      if (Array.isArray(response.data)) {
        raw = response.data;
      } else if (Array.isArray(response.data.data)) {
        raw = response.data.data;
      } else if (Array.isArray(response.data.data?.data)) {
        raw = response.data.data.data;
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

  // Cargar datos iniciales (horarios, sedes, ciudades, entidades) al montar el componente
  useEffect(() => {
    fetchData(); // Carga inicial de horarios
    // Cargar otros datos (pueden hacerse en paralelo)
    api.get('/sede').then(res => setSedes(res.data)).catch(err => console.error("Error fetching sedes:", err));
    api.get('/ciudad').then(res => setCiudades(res.data)).catch(err => console.error("Error fetching ciudades:", err));
    api.get('/entidad').then(res => setEntidades(res.data)).catch(err => console.error("Error fetching entidades:", err));
  }, []); // El array vacío [] asegura que solo se ejecuta una vez al montar

  // Manejar cambios en los inputs de filtro
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedFormData = { ...formData, [name]: value };

    // Función auxiliar para resetear campos
    const resetFields = (fieldsToReset) => {
        fieldsToReset.forEach(field => {
            updatedFormData[field] = "";
        });
    };

    // Lógica de reseteo y llamada a fetchData con filtros
    // Cuando cambias Ciudad, Sede o Entidad, resetea los otros filtros y el de búsqueda
    if (name === "ciudad" && value) {
        resetFields(["sede", "entidad", "filtro", "searchValue"]);
        fetchData("ciudad_id", value);
    } else if (name === "ciudad" && !value) {
         resetFields(["sede", "entidad", "filtro", "searchValue"]); // Resetear todo al quitar filtro de ciudad
        fetchData(); // Sin filtros
    }

    if (name === "sede" && value) {
        resetFields(["ciudad", "entidad", "filtro", "searchValue"]);
        fetchData("aula_sede", value);
    } else if (name === "sede" && !value) {
         resetFields(["ciudad", "entidad", "filtro", "searchValue"]); // Resetear todo al quitar filtro de sede
        fetchData(); // Sin filtros
    }

    if (name === "entidad" && value) {
      resetFields(["ciudad", "sede", "filtro", "searchValue"]);
      fetchData("entidad_id", value);
    } else if (name === "entidad" && !value) {
         resetFields(["ciudad", "sede", "filtro", "searchValue"]); // Resetear todo al quitar filtro de entidad
        fetchData(); // Sin filtros
    }

    // Cuando cambias el filtro de búsqueda O el valor de búsqueda
    // Resetea los filtros de Ciudad y Sede (porque el filtro de búsqueda aplica a todos)
    // Solo llama a fetchData si hay un filtro seleccionado Y un valor de búsqueda
    // O si ambos están vacíos (para recargar sin filtros)
    if (name === "filtro" || name === "searchValue") {
        resetFields(["ciudad", "sede", "entidad"]); // Resetear filtros de selección

        const newFilterValue = name === "filtro" ? value : formData.filtro;
        const newSearchValue = name === "searchValue" ? value : formData.searchValue;
        const trimmedSearchValue = (name === "searchValue" ? value : formData.searchValue).trim();


        if (newFilterValue && trimmedSearchValue) {
             fetchData(newFilterValue, trimmedSearchValue);
        } else if (!newFilterValue && !trimmedSearchValue) {
            // Si ambos filtro y searchValue están vacíos, cargar sin filtros
            fetchData();
        }
        // Si hay filtro pero no search value, o search value pero no filtro, no hacer nada (o mostrar un mensaje, etc.)
        // La lógica actual solo llama si *ambos* están presentes, lo cual parece razonable para una búsqueda filtrada.
        // O si *ambos* están vacíos.
    }

     // Manejar el caso especial si solo cambias searchValue y NO hay filtro seleccionado
     // En este caso, no llamas a fetchData hasta que selecciones un filtro.
     // La lógica de InputSearch (onSearchChange) ya maneja el caso de searchValue=""

    setFormData(updatedFormData);
  };


  return (
    <div className="flex flex-col min-h-screen">
      {/* Date Navigation */}
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
                disabled={isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 })}
                className="px-2 py-1 border rounded text-xs text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Ir a la semana actual"
            >
               Hoy
            </button>
         </div>
        <button
            onClick={goToNextWeek}
            className="p-2 rounded hover:bg-gray-100"
             aria-label="Semana siguiente"
            // No deshabilitamos "Siguiente semana" por defecto, a menos que sea la última semana con datos
            // La lógica de deshabilitar basada en `isCurrentWeek` de la versión parcial
            // era incorrecta, ya que impedía ver el futuro.
             // disabled={isCurrentWeek} // <-- Removed this
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
                                {/* <div className="text-[7px] md:text-[9px] text-gray-600">{classInfo.startTime} - {classInfo.endTime}</div> */}
                              </div>
                            ))}
                            {/* Rellenar espacio si no hay clases para mantener altura */}
                            {classesInfo.length === 0 && (
                                 <div className="p-1 invisible">.</div> // Punto invisible para mantener la altura de la fila
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                 {/* Si no hay datos después de cargar */}
                {!loading && scheduleData.length === 0 && rawData.length > 0 && (
                     <tr>
                        <td colSpan={days.length + 1} className="text-center py-4 text-gray-600">
                           No hay horarios programados para la semana del {currentDateRange}.
                        </td>
                    </tr>
                )}
                 {!loading && rawData.length === 0 && (
                     <tr>
                        <td colSpan={days.length + 1} className="text-center py-4 text-gray-600">
                           No se encontraron datos de horarios con los filtros aplicados.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters abajo */}
        <div className="p-2 md:p-4 flex items-center justify-between bg-white flex-wrap gap-2 mt-7">
          <div className="flex items-center gap-2 md:gap-5 flex-wrap">
            {/* <div className="flex items-center border rounded-md">
              <Button variant="ghost" className="flex items-center gap-1 rounded-none text-xs md:text-sm py-1 px-2 md:py-2 md:px-3 h-auto">
                <span>Todos los...</span>
                <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                </div> */}
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="ciudad" value="Ciudad" className="text-sm" />
              <SelectInput
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                options={[
                  { value: "", label: "Todas las Ciudades" },
                  ...ciudades.map((ciudad) => ({
                    value: ciudad.idCiudad,
                    label: ciudad.nombre,
                  })),
                ]}
                // required // Consider if this should be required
              />
            </div>
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="sede" value="Sede" className="text-sm" />
              <SelectInput
                id="sede"
                name="sede"
                value={formData.sede}
                onChange={handleChange}
                options={[
                  { value: "", label: "Todas las Sedes" },
                  ...sedes.map((sede) => ({
                    value: sede.idSede,
                    label: sede.nombre,
                  })),
                ]}
                 // required // Consider if this should be required
              />
            </div>
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="entidad" value="Entidad" className="text-sm" />
              <SelectInput
                id="entidad"
                name="entidad"
                value={formData.entidad}
                onChange={handleChange}
                options={[
                  { value: "", label: "Todas las Entidades" },
                  ...entidades.map((ent) => ({ value: ent.idEntidad, label: ent.nombre })),
                ]}
                 // required // Consider if this should be required
              />
            </div>

            {/* Search Input */}
             <div className="space-y-2 w-full sm:w-72 mx-1"> {/* Wrapped InputSearch in a div with space-y-2 */}
               <InputLabel htmlFor="search" value="Buscar" className="text-sm" /> {/* Added a label for accessibility/clarity */}
                <InputSearch
                  id="search" // Added an ID
                  valueInput={formData.searchValue}
                  placeHolderText="Buscar por aula o curso..."
                  onSearchChange={(value) => {
                    const trimmedValue = value.trim();
                    // Update search value and reset filters
                    setFormData((prev) => ({
                        ...prev,
                        searchValue: value,
                        ciudad: "",
                        sede: "",
                        entidad: "" // Reset entidad too
                    }));
                    // Trigger fetch if filter is selected OR if search value is empty
                    if (formData.filtro && trimmedValue !== "") {
                        fetchData(formData.filtro, trimmedValue);
                    } else if (trimmedValue === "" && !formData.filtro && !formData.ciudad && !formData.sede && !formData.entidad) {
                         // Only refetch without filters if search is empty AND no other filters are active
                         fetchData();
                    }
                     // If search is empty but a filter is active, the filter's change handler would have already fetched
                     // If search has a value but no filter is selected, wait for filter selection via handleChange('filtro')
                  }}
                />
              </div>

            {/* Filter Select */}
            <div className="space-y-2 min-w-[150px]"> {/* Added min-width */}
              <InputLabel htmlFor="filtro" value="Filtro de búsqueda" className="text-sm" /> {/* Added a label */}
              <SelectInput
                id="filtro"
                name="filtro"
                value={formData.filtro}
                onChange={handleChange}
                options={[
                  { value: "", label: "Filtrar por ..." },
                  ...filtrosDisponibles.map((filter) => ({
                    value: filter.value,
                    label: filter.label,
                  })),
                ]}
                 // required // Consider if this should be required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
