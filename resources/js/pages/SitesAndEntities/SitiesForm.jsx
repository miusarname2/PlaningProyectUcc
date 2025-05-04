import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import TextTareaInput from "@/Components/TextTareaInput";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
// import ToggleSwitch from "@/Components/ToggleSwitch"; // lo vamos a crear (Mantengo el comentario)
import ContainerShowData from "@/Components/ContainerShowData"; // Import the tag component
import { Save, XCircle, CalendarCheck2, CalendarX2 } from "lucide-react"; // Import icons
import { getApi } from "@/utils/generalFunctions";

// Componente para la sección de selección de fechas (simple inline)
// En un proyecto grande, podrías usar un modal dedicado.
function DatePickerSection({ entity, onConfirm, onCancel }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [errors, setErrors] = useState({});

    const handleConfirm = () => {
        const currentErrors = {};
        if (!startDate) currentErrors.startDate = "Fecha de inicio es obligatoria.";
        if (!endDate) currentErrors.endDate = "Fecha de fin es obligatoria.";
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            currentErrors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio.";
        }

        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            return;
        }

        onConfirm({
            idEntidad: entity.idEntidad,
            fechaInicio: startDate,
            fechaFin: endDate,
        });
         // Reset state after confirming (optional depending on desired flow)
         setStartDate("");
         setEndDate("");
         setErrors({});
    };

     const handleCancel = () => {
         setStartDate("");
         setEndDate("");
         setErrors({});
         onCancel(); // Call the parent's cancel handler
     }

    return (
        <div className="mt-4 p-4 border border-gray-300 rounded bg-gray-50">
            <h4 className="font-semibold mb-3">Configurar fechas para: {entity.nombre}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor={`startDate-${entity.idEntidad}`} value="Fecha de Inicio" />
                    <TextInput
                        id={`startDate-${entity.idEntidad}`}
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setErrors(prev => ({...prev, startDate: null, endDate: null})); }} // Clear relevant errors on change
                        required
                        isInvalid={!!errors.startDate}
                    />
                    {errors.startDate && <div className="text-red-500 text-sm">{errors.startDate}</div>}
                </div>
                <div>
                    <InputLabel htmlFor={`endDate-${entity.idEntidad}`} value="Fecha de Fin" />
                    <TextInput
                         id={`endDate-${entity.idEntidad}`}
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setErrors(prev => ({...prev, startDate: null, endDate: null})); }} // Clear relevant errors on change
                        required
                         isInvalid={!!errors.endDate}
                    />
                     {errors.endDate && <div className="text-red-500 text-sm">{errors.endDate}</div>}
                </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
                <button
                    type="button" // Prevent form submission
                    onClick={handleCancel}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
                >
                    Cancelar
                </button>
                <ButtonGradient type="button" onClick={handleConfirm}> {/* Use type="button" */}
                    <CalendarCheck2 className="h-4 w-4 mr-1" /> Confirmar Fechas
                </ButtonGradient>
            </div>
        </div>
    );
}


export default function SitiesForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [cities, setCities] = useState([]);
    const [entities, setEntities] = useState([]);

    // Nuevo estado para la entidad seleccionada temporalmente a la espera de fechas
    const [selectedEntityForDates, setSelectedEntityForDates] = useState(null);


    // Estado del formulario, selectedPrestatarias ahora contendrá OBJETOS { idEntidad, fechaInicio, fechaFin }
    // MODIFICACION AQUI: Transformar initialData.prestatarias si existe
    const [formData, setFormData] = useState(() => {
        // Transformar las prestatarias iniciales para que coincidan con la estructura esperada
        const initialSelectedPrestatarias = initialData?.prestatarias ?
            initialData.prestatarias.map(item => ({
                idEntidad: item.idEntidad,
                fechaInicio: item.pivot?.fechaInicio || '', // Asegurar que pivot y fechas existan
                fechaFin: item.pivot?.fechaFin || '',
            })) : []; // Si no hay initialData o prestatarias, iniciar con array vacío

        return {
            codigo: initialData?.codigoSede || "", // Usar codigoSede para editar
            nombre: initialData?.nombre || "",
            descripcion: initialData?.descripcion || "",
            tipo: initialData?.tipo || "Fisica",
            acceso: initialData?.acceso || "",
            idCiudad: initialData?.idCiudad || "",
            idEntidadPropietaria: initialData?.idEntidadPropietaria || "",
            // Usar el array transformado
            selectedPrestatarias: initialSelectedPrestatarias,
        };
    });
    const [errors, setErrors] = useState({});

    // ... (fetchCities y fetchEntities - no cambian) ...
     async function fetchCities() {
        try {
            const response = await api.get("/ciudad");
             // Add a default option at the beginning if cities are successfully fetched
            const citiesData = response.data || []; // Ensure it's an array even if data is null/undefined
            setCities([{ idCiudad: "", nombre: "Seleccionar Ciudad." }, ...citiesData]);
        } catch (error) {
            console.error("Error fetching cities:", error);
             // Set cities to just the default option if fetch fails
            setCities([{ idCiudad: "", nombre: "Error al cargar ciudades." }]);
        }
    }

     // Obtiene las entidades desde '/entidad'
     async function fetchEntities() {
        try {
            const response = await api.get("/entidad");
            // Store all fetched entities
             const entitiesData = response.data || [];
            setEntities(entitiesData);

        } catch (error) {
            console.error("Error fetching entities:", error);
             // Optionally clear entities or set an error state if fetching fails
            setEntities([]);
        }
    }

    // Cargar ciudades y entidades al montar el componente
    useEffect(() => {
        fetchCities();
        fetchEntities();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error for the field being changed
        if (errors[name]) {
             setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

     // Handler para seleccionar una prestataria del select (para agregar al tag list)
     const handleSelectBorrowerToAdd = (e) => {
        const selectedId = parseInt(e.target.value, 10); // Ensure it's a number

        // Si el usuario seleccionó la opción por defecto, ya está en la lista,
        // o ya hay una entidad esperando la selección de fechas, no hacer nada.
        if (
             !selectedId ||
             formData.selectedPrestatarias.some(p => p.idEntidad === selectedId) || // Check if ID exists in the objects array
             selectedEntityForDates
        ) {
             // Reset select value is not strictly needed if not adding/opening modal
             // e.target.value = ""; // Esto podría dar error, mejor dejar que el estado lo maneje si tuviéramos uno para el select
             return;
        }

        // Encontrar la entidad completa para mostrar su nombre en la sección de fechas
        const entityToAdd = entities.find(entity => entity.idEntidad === selectedId);

        if (entityToAdd) {
             setSelectedEntityForDates(entityToAdd); // Set the entity waiting for dates
             // Do NOT add to formData yet
        }

         // Resetear el valor del select después de la selección
         e.target.value = ""; // Force the select value back to the default/empty option visually
    };

    // Handler llamado cuando se confirman las fechas en la sección DatePickerSection
    const handleConfirmAddBorrowerWithDates = (borrowerObjectWithDates) => {
        setFormData(prev => ({
            ...prev,
            selectedPrestatarias: [...prev.selectedPrestatarias, borrowerObjectWithDates]
        }));
        setSelectedEntityForDates(null); // Clear the entity waiting for dates
        // Clear validation error for the list if it was showing
         if (errors.selectedPrestatarias) {
              setErrors(prev => ({ ...prev, selectedPrestatarias: null }));
         }
    };

    // Handler llamado cuando se cancela la selección de fechas
     const handleCancelAddBorrowerWithDates = () => {
         setSelectedEntityForDates(null); // Clear the entity waiting for dates
          // You might want to reset the select value here as well, depending on UI needs
     };


    // Handler para remover una prestataria de la lista de tags (ahora recibe el ID)
    const handleRemoveBorrower = (idToRemove) => {
        setFormData(prev => ({
            ...prev,
            // Filter by idEntidad within the objects
            selectedPrestatarias: prev.selectedPrestatarias.filter(item => item.idEntidad !== idToRemove)
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation (optional, backend should also validate)
        const currentErrors = {};
        if (!formData.nombre) currentErrors.nombre = "El nombre es obligatorio.";
        if (!formData.descripcion) currentErrors.descripcion = "La descripción es obligatoria.";
        if (!formData.idCiudad) currentErrors.idCiudad = "Debe seleccionar una ciudad.";
        if (!formData.tipo) currentErrors.tipo = "Debe seleccionar un tipo.";
        if (!formData.acceso) currentErrors.acceso = "La dirección/URL es obligatoria.";
        if (!formData.idEntidadPropietaria) currentErrors.idEntidadPropietaria = "Debe seleccionar una entidad propietaria.";

        // Validación: No permitir enviar si hay una entidad esperando fechas
        if (selectedEntityForDates) {
             currentErrors.selectedPrestatarias = `Debe confirmar o cancelar las fechas para ${selectedEntityForDates.nombre} antes de guardar.`;
        }

        // Validación: Cada prestataria seleccionada debe tener fechas? (Opcional)
        // Puedes añadir lógica aquí para validar que todos los objetos en selectedPrestatarias tengan fechas
        // Por ahora, la validación en DatePickerSection lo maneja antes de agregarlo.
        // Pero podrías validar aquí si la lista debe tener un mínimo, etc.

        if (Object.keys(currentErrors).length > 0) {
             setErrors(currentErrors);
             console.warn("Form validation errors:", currentErrors);
             return; // Stop submission if there are client-side errors
        }


        try {
             // Prepare the payload, including the new fields
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                tipo: formData.tipo,
                acceso: formData.acceso,
                idCiudad: parseInt(formData.idCiudad, 10), // Ensure IDs are numbers
                idEntidadPropietaria: parseInt(formData.idEntidadPropietaria, 10), // Ensure IDs are numbers
                // Send the array of selected prestataria OBJECTS {idEntidad, fechaInicio, fechaFin}
                // formData.selectedPrestatarias already has the correct format now
                entidades_prestatarias: formData.selectedPrestatarias,
                 // Only include id for PUT, not for POST
                ...(isEditMode && { id: initialData?.id }) // Assuming the API expects 'id' for PUT
            };

            // Generate code only on creation
            if (!isEditMode) {
                // THIS CODE GENERATION IS NOT SAFE IN A MULTI-USER ENVIRONMENT.
                // SERVER-SIDE CODE GENERATION IS HIGHLY RECOMMENDED.
                try {
                    const response = await api.get("/sede"); // Gets ALL sedes
                    const lengthRes = response.data.length; // Count them
                    const nextCodeNumber = lengthRes + 1;
                    const formattedNumber = String(nextCodeNumber).padStart(3, '0');
                    payload.codigo = `S${formattedNumber}`; // Add generated code to payload
                } catch (codeError) {
                    console.error("Error fetching sedes for code generation:", codeError);
                    // Decide how to handle this error - prevent submission or use a placeholder
                    setErrors({ general: "Error al generar el código de la sede. Intente de nuevo." });
                     return; // Stop submission
                }
            } else {
                 // If editing, keep the original code from initialData
                 payload.codigo = initialData?.codigoSede || initialData?.codigo || '';
            }



            if (isEditMode) {
                console.log(JSON.stringify(payload));
                await api.put(`/sede/${initialData?.id}`, payload);
            } else {
                 await api.post("/sede", payload);
            }

            // Clear form and errors on success (unless editing)
            if (!isEditMode) {
                 setFormData({
                     codigo: "",
                     nombre: "",
                     descripcion: "",
                     tipo: "Fisica",
                     acceso: "",
                     idCiudad: "",
                     idEntidadPropietaria: "",
                     selectedPrestatarias: [], // Reset array of objects
                 });
            }

            setErrors({}); // Clear all errors
            setSelectedEntityForDates(null); // Ensure temporary state is clean
            if (typeof onSubmitSuccess === "function") onSubmitSuccess();
            onCancel(); // Close the form/modal

        } catch (error) {
            console.error("Error saving record:", error);
            if (error.response?.status === 422) {
                // Handle validation errors from backend
                const backendErrors = error.response.data.errors || {};
                 setErrors(backendErrors);
                console.error("Backend validation errors:", backendErrors);
                // Map specific backend error names if they differ (e.g., 'entidades_prestatarias.0.fecha_inicio')
                // This can get complex for array items. Generic 'general' error might be better for arrays.
                // Or you could try to map, e.g., backend 'entidades_prestatarias' -> frontend 'selectedPrestatarias'
            } else {
                // Handle other types of errors (network, server error, etc.)
                // Display a generic error message to the user
                 setErrors({ general: `Error al guardar el registro: ${error.response?.data?.message || error.message}. Intente de nuevo.` });
                 console.error("API error details:", error.response?.data || error.message);
            }
        }
    };

    // Filter entities for the owner select - needs default option
    const ownerEntityOptions = [{ value: "", label: "Seleccionar Entidad Propietaria." }, ...entities.map(entity => ({
        value: entity.idEntidad,
        label: entity.nombre,
    }))];

    // Filter entities for the prestataria select - exclude selected *objects* by id, exclude owner, exclude default option
    const availableBorrowerEntities = entities.filter(entity =>
         // Entity is not already selected as a prestataria tag (check ID in selected objects)
        !formData.selectedPrestatarias.some(item => item.idEntidad === entity.idEntidad) &&
        // Entity is not the selected owner (if one is selected)
        (!formData.idEntidadPropietaria || entity.idEntidad !== parseInt(formData.idEntidadPropietaria, 10)) &&
         // Entity is not the one currently waiting for date input
         (!selectedEntityForDates || entity.idEntidad !== selectedEntityForDates.idEntidad)
    );

     const borrowerEntityOptions = [{ value: "", label: "Agregar Entidad Prestataria." }, ...availableBorrowerEntities.map(entity => ({
        value: entity.idEntidad,
        label: entity.nombre,
    }))];

    // Find the entity objects for displaying names in the selected prestatarias list
    // Now we map from the stored selectedPrestatarias (which already has ID and dates)
    const selectedPrestatariaDisplayData = formData.selectedPrestatarias
         .map(item => { // item is { idEntidad, fechaInicio, fechaFin }
             const entity = entities.find(e => e.idEntidad === item.idEntidad);
              // Return a combined object for display
             return entity ? { ...item, nombre: entity.nombre } : null;
         })
         .filter(item => item != null); // Remove nulls if an entity is not found


    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
             {/* Display general error message if any */}
             {errors.general && (
                 <div className="text-red-500 text-sm mb-4">{errors.general}</div>
             )}
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Campo para el nombre */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre"
                                required
                                isInvalid={!!errors.nombre}
                            />
                            {errors.nombre && <div className="text-red-500 text-sm">{errors.nombre}</div>}
                        </div>

                        {/* Campo para seleccionar la entidad propietaria */}
                         <div className="space-y-2">
                            <InputLabel htmlFor="idEntidadPropietaria" value="Entidad Propietaria" />
                            <SelectInput
                                id="idEntidadPropietaria"
                                name="idEntidadPropietaria"
                                value={formData.idEntidadPropietaria}
                                onChange={handleChange}
                                options={ownerEntityOptions}
                                required
                                isInvalid={!!errors.idEntidadPropietaria}
                            />
                             {errors.idEntidadPropietaria && <div className="text-red-500 text-sm">{errors.idEntidadPropietaria}</div>}
                        </div>

                        {/* Campo para la descripción (ocupa dos columnas) */}
                        <div className="space-y-2 md:col-span-2">
                            <InputLabel htmlFor="descripcion" value="Descripción" />
                            <TextTareaInput
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Ingrese la descripción"
                                rows={4}
                                required
                                isInvalid={!!errors.descripcion}
                            />
                             {errors.descripcion && <div className="text-red-500 text-sm">{errors.descripcion}</div>}
                        </div>

                         {/* Campo para seleccionar el tipo */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="tipo" value="Tipo" />
                            <SelectInput
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                options={[
                                    { value: "Fisica", label: "Fisica" },
                                    { value: "Virtual", label: "Virtual" },
                                ]}
                                required
                                isInvalid={!!errors.tipo}
                            />
                             {errors.tipo && <div className="text-red-500 text-sm">{errors.tipo}</div>}
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idCiudad" value="Ciudad" />
                            <SelectInput
                                id="idCiudad"
                                name="idCiudad"
                                value={formData.idCiudad}
                                onChange={handleChange}
                                options={cities.map(city => ({ value: city.idCiudad, label: city.nombre }))}
                                required
                                isInvalid={!!errors.idCiudad} // Add validation prop
                            />
                             {errors.idCiudad && <div className="text-red-500 text-sm">{errors.idCiudad}</div>} {/* Add error message */}
                        </div>

                        {/* Campo para Dirección/URL según el tipo (ocupa dos columnas)*/}
                        <div className="space-y-2 md:col-span-2">
                            <InputLabel htmlFor="acceso" value="Dirección/Url" />
                            {/* Use a single TextInput, placeholder adapts based on type */}
                            <TextInput
                                id="acceso"
                                name="acceso"
                                value={formData.acceso}
                                onChange={handleChange}
                                placeholder={formData.tipo === "Fisica" ? "Ingrese la dirección" : "Ingrese la URL"}
                                required
                                isInvalid={!!errors.acceso}
                            />
                             {errors.acceso && <div className="text-red-500 text-sm">{errors.acceso}</div>}
                        </div>

                        {/* Campo para seleccionar Entidades Prestatarias (ocupa dos columnas)*/}
                         <div className="space-y-2 md:col-span-2">
                            <InputLabel htmlFor="addPrestataria" value="Entidades Prestatarias" />
                            <SelectInput
                                id="addPrestataria"
                                // name="addPrestataria" // Name is not needed if value is controlled by state we don't use directly for formData
                                value="" // Keep the select value controlled/reset
                                onChange={handleSelectBorrowerToAdd} // Use dedicated handler
                                options={borrowerEntityOptions}
                                disabled={!!selectedEntityForDates} // Disable while a date picker is active
                                // required={false} // This select is for adding
                                // isInvalid={!!errors.selectedPrestatarias} // Show error if validation applies to the list
                                placeholder="Agregar Entidad Prestataria." // Using a placeholder might be better than default option if desired
                            />
                            {/* Mostrar error si hay uno relacionado con la lista o con la espera de fechas */}
                            {errors.selectedPrestatarias && <div className="text-red-500 text-sm">{errors.selectedPrestatarias}</div>}

                            {/* Renderizar la sección de selección de fechas si hay una entidad seleccionada */}
                            {selectedEntityForDates && (
                                 <DatePickerSection
                                     entity={selectedEntityForDates}
                                     onConfirm={handleConfirmAddBorrowerWithDates}
                                     onCancel={handleCancelAddBorrowerWithDates}
                                 />
                            )}

                            {/* Area para mostrar las entidades prestatarias seleccionadas como tags */}
                            {/* Esto se muestra solo si no hay una sección de fechas activa */}
                            {!selectedEntityForDates && (
                                 <div className="mt-2 flex flex-wrap items-center gap-2 border border-gray-300 p-2 rounded min-h-[40px]">
                                     {selectedPrestatariaDisplayData.length === 0 && (
                                         <span className="text-gray-500 text-sm">Ninguna entidad prestataria seleccionada.</span>
                                     )}
                                     {selectedPrestatariaDisplayData.map(item => ( // Map over items {idEntidad, nombre, fechaInicio, fechaFin}
                                         <div key={item.idEntidad} className="inline-flex items-center border border-blue-200 rounded-md pl-2 py-1 pr-1 bg-blue-50">
                                             {/* Show Entity Name */}
                                             <span className="text-blue-700 text-sm font-medium">{item.nombre}</span>
                                             {/* Show Dates */}
                                             <span className="text-blue-600 text-xs ml-2">
                                                 {/* Format dates if needed, raw YYYY-MM-DD is okay too */}
                                                 ({item.fechaInicio} - {item.fechaFin})
                                             </span>
                                             {/* Remove button */}
                                             <button
                                                type="button"
                                                 onClick={() => handleRemoveBorrower(item.idEntidad)} // Pass the entity ID to remove
                                                className="ml-1 p-0.5 text-blue-600 hover:text-blue-800 focus:outline-none rounded-sm"
                                             >
                                                 <XCircle size={14} /> {/* Lucide icon for close */}
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                            )}
                        </div> {/* End Entidades Prestatarias Field */}

                    </div> {/* End grid */}

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel} disabled={!!selectedEntityForDates}>
                             Cancelar
                        </CancelButton>
                        <ButtonGradient type="submit" disabled={!!selectedEntityForDates}> {/* Disable submit while dates are being picked */}
                             <Save className="h-4 w-4 mr-1" />
                            {isEditMode ? "Guardar Cambios" : "Crear Registro"}
                        </ButtonGradient>
                    </div>
                </div> {/* End space-y-6 */}
            </form>
        </div> // End rounded-lg border
    );
}