import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import { useToast } from '@/lib/toast-context'
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save, XCircle } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";
import { useLoader } from "@/Components/LoaderProvider";

export default function ClassForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const { show, hide } = useLoader();
    const api = getApi();
    const { toast } = useToast();

    // Assumes initialData now represents the 'Class' entity, not just a single 'Horario'
    const isEditMode = Boolean(initialData?.id); // Check for the class ID for edit mode

    // Master lists
    const [courses, setCourses] = useState([]);
    const [professionals, setProfessionals] = useState([]); // Full list of professionals
    const [rolesDocentes, setRolesDocentes] = useState([]);
    const [cities, setCities] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [dia, setDia] = useState([]);

    // Form state - Adjusted for multiple professionals and multiple schedule slots
    const [formData, setFormData] = useState(() => {
        // Transform initialData if it exists to match the new structure
        const initialProfessionals = initialData?.profesionales ?
            initialData.profesionales.map(prof => ({
                idProfesional: prof.idProfesional,
                role: prof.pivot?.role || prof.role || '', // Adapt based on actual initialData structure
            })) : [];

        const initialScheduleSlots = initialData?.horarios ?
            initialData.horarios.map(slot => ({
                idDia: slot.pivot.idDia,
                hora_inicio: slot.hora_inicio?.slice(0, 5) || '',
                hora_fin: slot.hora_fin?.slice(0, 5) || '',
            }))
            : [];

        return {
            idCurso: initialData?.idCurso || "",
            // idProfesional is replaced by the array below
            ciudad: "", // Derived
            idSede: initialData?.idSede || "", // Can be derived from initialData?.idAula
            idAula: initialData?.idAula || "",
            // dia, hora_inicio, hora_fin are replaced by the array below

            // New fields for multiple professionals and schedules
            selectedProfessionals: initialProfessionals, // Array of { idProfesional, role }
            selectedScheduleSlots: initialScheduleSlots, // Array of { dia, hora_inicio, hora_fin }
        };
    });

    // State for handling professional assignment (like selectedEntityForDates in SitiesForm)
    const [professionalPendingRoleSelection, setProfessionalPendingRoleSelection] = useState(null); // { idProfesional, nombre }
    const [selectedRoleForPendingProf, setSelectedRoleForPendingProf] = useState(''); // Role selected for the pending professional

    const [errors, setErrors] = useState({}); // Keep track of validation errors

    // Define days for scheduling
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // --- Fetch Master Lists ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [coursesRes, professionalsRes, citiesRes, sedesRes, aulasRes, rolesDocentesRes, diaRes] = await Promise.all([
                    api.get('/curso'),
                    api.get('/profesional'),
                    api.get('/ciudad'),
                    api.get('/sede'),
                    api.get('/aula'),
                    api.get('/rolDocente'),
                    api.get('/dia'),
                ]);
                setCourses(coursesRes.data || []);
                setProfessionals(professionalsRes.data || []);
                setCities(citiesRes.data || []);
                setSedes(sedesRes.data || []);
                setAulas(aulasRes.data || []);
                setRolesDocentes(rolesDocentesRes.data.data || []);
                setDia(diaRes.data.data || []);
            } catch (error) {
                console.error('Error fetching master lists:', error);
                toast({ title: '¡Error!', description: 'No se pudieron cargar las listas de opciones.', variant: 'error' });
                // Consider setting default empty arrays or error states if fetch fails
                setCourses([]);
                setProfessionals([]);
                setCities([]);
                setSedes([]);
                setAulas([]);
            }
        };
        fetchData();
    }, []); // Empty dependency array means this runs once on mount

    // --- Derive ciudad and idSede from initialData or user selection ---
    useEffect(() => {
        // If in edit mode and sedes/aulas are loaded, try to set ciudad and idSede from initialData.idAula
        if (isEditMode && aulas.length > 0 && sedes.length > 0 && formData.idAula && !formData.idSede) {
            const aula = aulas.find(a => String(a.idAula) === String(formData.idAula));
            if (aula) {
                const sede = sedes.find(s => String(s.idSede) === String(aula.idSede));
                if (sede) {
                    setFormData(prev => ({
                        ...prev,
                        idSede: String(aula.idSede), // Set sede from aula
                        ciudad: String(sede.idCiudad) // Set ciudad from sede
                    }));
                } else {
                    // If sede not found for the aula, something is wrong or data is incomplete
                    console.warn(`Sede with ID ${aula.idSede} not found for Aula ${formData.idAula}`);
                }
            } else {
                console.warn(`Aula with ID ${formData.idAula} not found.`);
            }
        }
        // If idSede is available (either from initialData or derived from aula), set the city
        else if (formData.idSede && cities.length > 0 && sedes.length > 0) {
            const selSede = sedes.find(s => String(s.idSede) === String(formData.idSede));
            if (selSede && String(selSede.idCiudad) !== String(formData.ciudad)) {
                setFormData(prev => ({ ...prev, ciudad: String(selSede.idCiudad) }));
            }
        }

        // If only city is set initially (less likely for edit mode if Aula/Sede are present)
        // No automatic sede/aula derivation from city on initial load, user selects them.

    }, [isEditMode, aulas, sedes, cities, formData.idAula, formData.idSede, formData.ciudad]);


    // --- Dependent lists ---
    const availableSedes = sedes.filter(s => String(s.idCiudad) === String(formData.ciudad));
    const availableAulas = aulas.filter(a => String(a.idSede) === String(formData.idSede));

    // List of professionals *not yet* assigned to the class (excluding the one pending role selection)
    const availableProfessionalsForAssignment = professionals.filter(p =>
        !formData.selectedProfessionals.some(sp => String(sp.idProfesional) === String(p.idProfesional)) &&
        (!professionalPendingRoleSelection || String(professionalPendingRoleSelection.idProfesional) !== String(p.idProfesional))
    );

    // --- General Form Field Change Handler ---
    const handleChange = e => {
        const { name, value } = e.target;
        let update = { [name]: value };

        // If city changes, reset sede and aula
        if (name === 'ciudad') {
            update = { ciudad: value, idSede: '', idAula: '' };
            // Clear errors related to sede/aula as they are reset
            if (errors.idSede) setErrors(prev => ({ ...prev, idSede: null }));
            if (errors.idAula) setErrors(prev => ({ ...prev, idAula: null }));
        }

        // If sede changes, reset aula
        if (name === 'idSede') {
            update.idAula = '';
            // Clear errors related to aula
            if (errors.idAula) setErrors(prev => ({ ...prev, idAula: null }));
        }

        setFormData(prev => ({ ...prev, ...update }));
        // Clear error for the field being changed
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // --- Professional Assignment Handlers ---

    // Handler when a professional is selected from the dropdown to be added
    const handleSelectProfessionalToAdd = (e) => {
        const selectedId = parseInt(e.target.value, 10);

        // If no ID or already pending, do nothing
        if (!selectedId || professionalPendingRoleSelection) {
            e.target.value = ""; // Reset select visual state
            return;
        }

        // Find the professional object
        const professional = professionals.find(p => p.idProfesional === selectedId);

        if (professional) {
            setProfessionalPendingRoleSelection({ idProfesional: professional.idProfesional, nombreCompleto: professional.nombreCompleto });
            setSelectedRoleForPendingProf(''); // Reset role selection
            // Clear error related to professional list if showing
            if (errors.selectedProfessionals) {
                setErrors(prev => ({ ...prev, selectedProfessionals: null }));
            }
        }
        e.target.value = ""; // Reset select visual state
    };

    // Handler for changing the role for the pending professional
    const handleRoleChangeForPendingProf = (e) => {
        setSelectedRoleForPendingProf(e.target.value);
    };

    // Handler to confirm adding the professional with the selected role
    const handleAddProfessional = () => {
        if (!professionalPendingRoleSelection || !selectedRoleForPendingProf) {
            // Basic validation: Professional and role must be selected
            toast({ title: '¡Advertencia!', description: 'Debe seleccionar un Profesional y un Rol.', variant: 'warning' });
            return;
        }

        // Add the professional with their role to the formData professionals list
        setFormData(prev => ({
            ...prev,
            selectedProfessionals: [
                ...prev.selectedProfessionals,
                {
                    idProfesional: professionalPendingRoleSelection.idProfesional,
                    role: selectedRoleForPendingProf,
                }
            ]
        }));

        // Reset pending state and role selection
        setProfessionalPendingRoleSelection(null);
        setSelectedRoleForPendingProf('');
        // Clear validation error for the list if it was showing
        if (errors.profesionales) { // Assuming backend validates 'profesionales' array
            setErrors(prev => ({ ...prev, profesionales: null }));
        }
    };

    // Handler to cancel the professional role selection
    const handleCancelAddProfessional = () => {
        setProfessionalPendingRoleSelection(null);
        setSelectedRoleForPendingProf('');
    };

    // Handler to remove a professional from the assigned list
    const handleRemoveProfessional = (idToRemove) => {
        setFormData(prev => ({
            ...prev,
            selectedProfessionals: prev.selectedProfessionals.filter(p => String(p.idProfesional) !== String(idToRemove))
        }));
        // Clear error related to professional list if showing
        if (errors.profesionales) {
            setErrors(prev => ({ ...prev, profesionales: null }));
        }
    };

    // --- Schedule Slots Handlers ---

    // Handler for toggling a day's checkbox
    const handleDayToggle = (idDia, isChecked) => {
        setFormData(prev => {
            // Copiamos el array actual
            let slots = [...prev.selectedScheduleSlots];

            if (isChecked) {
                // Si no está ya, lo agregamos con horas vacías
                if (!slots.some(s => s.idDia === idDia)) {
                    slots.push({ idDia, hora_inicio: '', hora_fin: '' });
                }
            } else {
                // Filtramos para eliminar el slot de ese día
                slots = slots.filter(s => s.idDia !== idDia);
                // Limpiamos errores relacionados a ese idDia
                setErrors(err => {
                    const cleaned = { ...err };
                    delete cleaned[`horarios.${idDia}.hora_inicio`];
                    delete cleaned[`horarios.${idDia}.hora_fin`];
                    return cleaned;
                });
            }

            return { ...prev, selectedScheduleSlots: slots };
        });

        // Limpiamos error general de horarios si existiera
        setErrors(err => ({ ...err, horarios: null }));
    };

    // Handler for changing start/end time for a specific day
    const handleTimeChange = (idDia, field, value) => {
        setFormData(prev => {
            const slots = prev.selectedScheduleSlots.map(slot =>
                slot.idDia === idDia
                    ? { ...slot, [field]: value }
                    : slot
            );
            return { ...prev, selectedScheduleSlots: slots };
        });

        // Limpiamos el error específico de este campo si existiera
        const key = `horarios.${idDia}.${field}`;
        setErrors(err => ({ ...err, [key]: null }));

        // También limpiamos error general de horarios
        setErrors(err => ({ ...err, horarios: null }));
    };

    // --- Form Submission ---
    const handleSubmit = async e => {
        e.preventDefault();
        show();
        setErrors({}); // Clear previous errors

        // Basic client-side validation (optional, backend should also validate)
        const currentErrors = {};
        if (!formData.idCurso) currentErrors.idCurso = ['Debe seleccionar un Curso.'];
        if (!formData.idAula) currentErrors.idAula = ['Debe seleccionar un Aula.'];
        if (formData.selectedProfessionals.length === 0) currentErrors.profesionales = ['Debe asignar al menos un Profesional.'];
        if (formData.selectedScheduleSlots.length === 0) currentErrors.horarios = ['Debe asignar al menos un Día y Horario.'];

        // Validate time slots
        formData.selectedScheduleSlots.forEach(slot => {
            if (!slot.hora_inicio) currentErrors[`horarios.${slot.dia}.hora_inicio`] = [`La hora de inicio es obligatoria para ${slot.dia}.`];
            if (!slot.hora_fin) currentErrors[`horarios.${slot.dia}.hora_fin`] = [`La hora de fin es obligatoria para ${slot.dia}.`];
            if (slot.hora_inicio && slot.hora_fin && slot.hora_inicio >= slot.hora_fin) {
                currentErrors[`horarios.${slot.dia}.hora_fin`] = [`La hora de fin debe ser posterior a la hora de inicio en ${slot.dia}.`];
            }
        });

        // Prevent submission if professional is pending role selection
        if (professionalPendingRoleSelection) {
            currentErrors.profesionales = [`Confirme o cancele la asignación de ${professionalPendingRoleSelection.nombreCompleto} antes de guardar.`];
        }


        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            hide();
            toast({ title: '¡Error!', description: 'Revisa los datos ingresados.', variant: 'error' });
            console.warn("Client-side validation errors:", currentErrors);
            return; // Stop submission
        }


        // Prepare the payload with the new structure
        const payload = {
            idCurso: Number(formData.idCurso),
            idAula: Number(formData.idAula),
            docentes: formData.selectedProfessionals.map(p => ({
                idProfesional: p.idProfesional,
                idRolDocente: p.role
            })),
            // Use the arrays from state
            dias: formData.selectedScheduleSlots.map(s => s.idDia),
            hora_inicio: formData.selectedScheduleSlots.length
                ? formData.selectedScheduleSlots[0].hora_inicio + ':00'
                : null,
            hora_fin: formData.selectedScheduleSlots.length
                ? formData.selectedScheduleSlots[0].hora_fin + ':00'
                : null
        };

        console.log("Submitting payload:", JSON.stringify(payload));


        try {
            // Assuming a new conceptual endpoint like '/class' for managing the full class entity
            if (isEditMode) {
                // Use the initialData ID for the PUT request
                await api.put(`/Horario/${initialData.idHorario}`, payload);
            } else {
                await api.post('/Horario', payload);
            }
            hide();
            setErrors({}); // Clear errors on success
            // Reset form data after creation (optional, depending on desired flow)
            if (!isEditMode) {
                setFormData({
                    idCurso: "",
                    ciudad: "",
                    idSede: "",
                    idAula: "",
                    selectedProfessionals: [],
                    selectedScheduleSlots: [],
                });
                setSelectedRoleForPendingProf('');
            }

            onSubmitSuccess?.();
            onCancel(); // Close the form/modal

        } catch (err) {
            hide();
            console.error("Submission Error:", err);
            if (err.response?.status === 422) {
                // Handle validation errors from backend, potentially mapping to state keys
                const backendErrors = err.response.data.errors || {};
                // Backend might return errors like 'profesionales.0.role' or 'horarios.1.hora_inicio'
                // Mapping these directly to state keys can be complex.
                // For this example, I'll try a basic merge, but you might need custom mapping.
                // Also display a general error toast.
                setErrors(prev => ({ ...prev, ...backendErrors }));
                toast({ title: '¡Error!', description: 'Revisa los datos ingresados.', variant: 'error' });
                console.error("Backend validation errors:", backendErrors);

            } else if (err.response?.status === 409) {
                // Conflict, potentially schedule or professional conflict
                toast({ title: '¡Error!', description: 'Conflicto de horario o profesional.', variant: 'error' });
                // You might want to parse the 409 response body for specific details if the API provides them
            } else {
                console.error(err);
                toast({ title: '¡Error!', description: 'Error inesperado al guardar.', variant: 'error' });
            }
        }
    };

    // Helper to find professional name by ID for display
    const getProfessionalName = (id) => {
        const prof = professionals.find(p => String(p.idProfesional) === String(id));
        return prof ? prof.nombreCompleto : 'Profesional Desconocido';
    };


    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            {/* Display general error message if any */}
            {errors.general && (
                <div className="text-red-500 text-sm mb-4">{errors.general}</div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Curso */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idCurso" value="Curso" />
                            <SelectInput id="idCurso" name="idCurso" value={formData.idCurso} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Curso.', disabled: true },
                                ...courses.map(c => ({ value: c.idCurso, label: c.nombre }))]}
                                required error={errors.idCurso}
                                isInvalid={!!errors.idCurso} // Add isInvalid prop
                                className={errors.idCurso ? 'border-red-500' : ''} // Tailwind class for error border
                            />
                            {errors.idCurso && <p className="text-red-500 text-sm">{errors.idCurso[0]}</p>}
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="ciudad" value="Ciudad" />
                            <SelectInput id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Ciudad.', disabled: true },
                                ...cities.map(c => ({ value: c.idCiudad, label: c.nombre }))]}
                                required error={errors.ciudad}
                                isInvalid={!!errors.ciudad}
                                className={errors.ciudad ? 'border-red-500' : ''}
                            />
                            {errors.ciudad && <p className="text-red-500 text-sm">{errors.ciudad[0]}</p>}
                        </div>

                        {/* Sede */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idSede" value="Sede" />
                            <SelectInput id="idSede" name="idSede" value={formData.idSede} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Sede.', disabled: true },
                                ...availableSedes.map(s => ({ value: s.idSede, label: s.nombre }))]}
                                required error={errors.idSede}
                                isInvalid={!!errors.idSede}
                                className={errors.idSede ? 'border-red-500' : ''}
                            />
                            {errors.idSede && <p className="text-red-500 text-sm">{errors.idSede[0]}</p>}
                        </div>

                        {/* Aula */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idAula" value="Aula" />
                            <SelectInput id="idAula" name="idAula" value={formData.idAula} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Aula.', disabled: true },
                                ...availableAulas.map(a => ({ value: a.idAula, label: a.nombre }))]}
                                required error={errors.idAula}
                                isInvalid={!!errors.idAula}
                                className={errors.idAula ? 'border-red-500' : ''}
                            />
                            {errors.idAula && <p className="text-red-500 text-sm">{errors.idAula[0]}</p>}
                        </div>

                        {/* Sección para Asignar Profesionales (ocupa dos columnas) */}
                        <div className="space-y-2 md:col-span-2">
                            <InputLabel htmlFor="addProfessional" value="Asignar Profesionales" />
                            {/* Select para elegir un profesional a añadir */}
                            <SelectInput
                                id="addProfessional"
                                value="" // Value is controlled internally, reset after selection
                                onChange={handleSelectProfessionalToAdd}
                                options={[{ value: '', label: 'Seleccione Profesional para asignar.', disabled: true },
                                ...availableProfessionalsForAssignment.map(p => ({ value: p.idProfesional, label: p.nombreCompleto }))]}
                                disabled={!!professionalPendingRoleSelection || professionals.length === 0} // Disable if adding is in progress or no professionals loaded
                            // No 'required' here, as this is an add-select
                            />

                            {/* Mostrar errores relacionados con la lista general de profesionales */}
                            {errors.profesionales && <p className="text-red-500 text-sm">{errors.profesionales[0]}</p>}


                            {/* Sección para seleccionar el Rol si hay un profesional pendiente */}
                            {professionalPendingRoleSelection && (
                                <div className="mt-4 p-4 border border-blue-200 rounded-md bg-blue-50 space-y-3">
                                    <p className="font-semibold text-blue-800">Asignar Rol a: {professionalPendingRoleSelection.nombreCompleto}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <InputLabel htmlFor="professionalRole" value="Rol" />
                                            <SelectInput
                                                id="professionalRole"
                                                name="professionalRole"
                                                value={selectedRoleForPendingProf}
                                                onChange={handleRoleChangeForPendingProf}
                                                options={[{ value: '', label: 'Seleccione Rol.', disabled: true },
                                                ...rolesDocentes.map(role => ({ value: role.idRolDocente, label: role.nombre }))]}
                                                required // Role is required once a professional is selected to be added
                                            // isInvalid={...} // Add role-specific validation error handling if needed
                                            />
                                            {/* Add error message specific to role if needed */}
                                        </div>
                                        {/* Empty div for layout on md+ */}
                                        <div></div>
                                    </div>


                                    <div className="flex justify-end space-x-2 mt-3">
                                        <CancelButton type="button" onClick={handleCancelAddProfessional}>Cancelar</CancelButton>
                                        <ButtonGradient type="button" onClick={handleAddProfessional}>
                                            <Save className="h-4 w-4 mr-1" /> Confirmar Rol
                                        </ButtonGradient>
                                    </div>
                                </div>
                            )}


                            {/* Área para mostrar los profesionales asignados como tags */}
                            {/* Ocultar mientras se está seleccionando el rol */}
                            {!professionalPendingRoleSelection && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 border border-gray-300 p-2 rounded min-h-[40px]">
                                    {formData.selectedProfessionals.length === 0 && (
                                        <span className="text-gray-500 text-sm">Ningún profesional asignado.</span>
                                    )}
                                    {formData.selectedProfessionals.map(assignedProf => (
                                        <div key={assignedProf.idProfesional} className="inline-flex items-center border border-green-200 rounded-md pl-2 py-1 pr-1 bg-green-50">
                                            <span className="text-green-800 text-sm font-medium">{getProfessionalName(assignedProf.idProfesional)}</span>
                                            <span className="text-green-700 text-xs ml-2">({assignedProf.role})</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveProfessional(assignedProf.idProfesional)}
                                                className="ml-1 p-0.5 text-green-600 hover:text-green-800 focus:outline-none rounded-sm"
                                            >
                                                <XCircle size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div> {/* End Asignar Profesionales Section */}


                        {/* Sección para Horarios (ocupa dos columnas) */}
                        <div className="space-y-4 md:col-span-2">
                            <InputLabel value="Horarios de Clase" />
                            {/* Show general schedule errors */}
                            {errors.horarios && typeof errors.horarios === 'string' && ( // Assuming general horarios error is a string
                                <p className="text-red-500 text-sm">{errors.horarios}</p>
                            )}
                            <div className="border border-gray-300 p-4 rounded grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {dia.map(d => {
                                    const slot = formData.selectedScheduleSlots.find(s => s.idDia === d.idDia);
                                    const isSelected = !!slot;
                                    return (
                                        <div key={d.idDia} className="flex flex-col">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={e => handleDayToggle(d.idDia, e.target.checked)}
                                                />
                                                <span className="ml-2">{d.nombre}</span>
                                            </label>

                                            {isSelected && (
                                                <div className="flex space-x-2 mt-2">
                                                    <input
                                                        type="time"
                                                        value={slot.hora_inicio}
                                                        onChange={e => handleTimeChange(d.idDia, 'hora_inicio', e.target.value)}
                                                    />
                                                    <input
                                                        type="time"
                                                        value={slot.hora_fin}
                                                        onChange={e => handleTimeChange(d.idDia, 'hora_fin', e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Specific errors keyed by day and time field will appear under the inputs */}
                        </div> {/* End Horarios Section */}


                    </div> {/* End grid grid-cols-1 md:grid-cols-2 */}

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel} disabled={!!professionalPendingRoleSelection}>
                            Cancelar
                        </CancelButton>
                        <ButtonGradient type="submit" disabled={!!professionalPendingRoleSelection}> {/* Disable submit while professional is pending role */}
                            <Save className="h-4 w-4 mr-1" />
                            {isEditMode ? 'Guardar Cambios' : 'Crear Clase'}
                        </ButtonGradient>
                    </div>
                </div> {/* End space-y-6 */}
            </form>
        </div> // End rounded-lg border
    );
}
