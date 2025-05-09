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

    const isEditMode = Boolean(initialData?.id);

    const [courses, setCourses] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [rolesDocentes, setRolesDocentes] = useState([]);
    const [cities, setCities] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [aulas, setAulas] = useState([]);
    const [dia, setDia] = useState([]);
    const getRoleName = (roleId) => rolesDocentes.find(r => String(r.idRolDocente) === String(roleId))?.nombre || '—';

    // Form state - Adjusted for multiple professionals and multiple schedule slots
    const [formData, setFormData] = useState(() => {
        const initialProfessionals = initialData?.profesionales?.map(prof => ({
            idProfesional: prof.idProfesional,
            role: String(prof.pivot.idRolDocente),
        })) || [];

        const initialScheduleSlots = initialData?.dias?.map(slot => ({
            idDia: slot.pivot.idDia,
            hora_inicio: slot.pivot.hora_inicio.slice(0, 5),
            hora_fin: slot.pivot.hora_fin.slice(0, 5),
        })) || [];

        return {
            idCurso: initialData?.idCurso || "",
            ciudad: "",
            idSede: initialData?.idSede || "",
            idAula: initialData?.idAula || "",

            selectedProfessionals: initialProfessionals,
            selectedScheduleSlots: initialScheduleSlots,
        };
    });

    const [professionalPendingRoleSelection, setProfessionalPendingRoleSelection] = useState(null);
    const [selectedRoleForPendingProf, setSelectedRoleForPendingProf] = useState('');

    const [errors, setErrors] = useState({});

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    // --- Fetch Master Lists ---
    useEffect(() => {
        show();
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
                setCourses([]);
                setProfessionals([]);
                setCities([]);
                setSedes([]);
                setAulas([]);
            }
        };
        fetchData();
    }, []);

    // --- Derive ciudad and idSede from initialData or user selection ---
    useEffect(() => {
        if (isEditMode && aulas.length > 0 && sedes.length > 0 && formData.idAula && !formData.idSede) {
            const aula = aulas.find(a => String(a.idAula) === String(formData.idAula));
            if (aula) {
                const sede = sedes.find(s => String(s.idSede) === String(aula.idSede));
                if (sede) {
                    setFormData(prev => ({
                        ...prev,
                        idSede: String(aula.idSede),
                        ciudad: String(sede.idCiudad)
                    }));
                } else {
                    console.warn(`Sede with ID ${aula.idSede} not found for Aula ${formData.idAula}`);
                }
            } else {
                console.warn(`Aula with ID ${formData.idAula} not found.`);
            }
        }
        else if (formData.idSede && cities.length > 0 && sedes.length > 0) {
            const selSede = sedes.find(s => String(s.idSede) === String(formData.idSede));
            if (selSede && String(selSede.idCiudad) !== String(formData.ciudad)) {
                setFormData(prev => ({ ...prev, ciudad: String(selSede.idCiudad) }));
            }
        }

    }, [isEditMode, aulas, sedes, cities, formData.idAula, formData.idSede, formData.ciudad]);


    // --- Dependent lists ---
    const availableSedes = sedes.filter(s => String(s.idCiudad) === String(formData.ciudad));
    const availableAulas = aulas.filter(a => String(a.idSede) === String(formData.idSede));
    hide();

    const availableProfessionalsForAssignment = professionals.filter(p =>
        !formData.selectedProfessionals.some(sp => String(sp.idProfesional) === String(p.idProfesional)) &&
        (!professionalPendingRoleSelection || String(professionalPendingRoleSelection.idProfesional) !== String(p.idProfesional))
    );

    // --- General Form Field Change Handler ---
    const handleChange = e => {
        const { name, value } = e.target;
        let update = { [name]: value };

        if (name === 'ciudad') {
            update = { ciudad: value, idSede: '', idAula: '' };
            if (errors.idSede) setErrors(prev => ({ ...prev, idSede: null }));
            if (errors.idAula) setErrors(prev => ({ ...prev, idAula: null }));
        }

        if (name === 'idSede') {
            update.idAula = '';
            if (errors.idAula) setErrors(prev => ({ ...prev, idAula: null }));
        }

        setFormData(prev => ({ ...prev, ...update }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // --- Professional Assignment Handlers ---

    const handleSelectProfessionalToAdd = (e) => {
        const selectedId = parseInt(e.target.value, 10);

        if (!selectedId || professionalPendingRoleSelection) {
            e.target.value = "";
            return;
        }

        const professional = professionals.find(p => p.idProfesional === selectedId);

        if (professional) {
            setProfessionalPendingRoleSelection({ idProfesional: professional.idProfesional, nombreCompleto: professional.nombreCompleto });
            setSelectedRoleForPendingProf('');
            if (errors.selectedProfessionals) {
                setErrors(prev => ({ ...prev, selectedProfessionals: null }));
            }
        }
        e.target.value = "";
    };

    const handleRoleChangeForPendingProf = (e) => {
        setSelectedRoleForPendingProf(e.target.value);
    };

    const handleAddProfessional = () => {
        if (!professionalPendingRoleSelection || !selectedRoleForPendingProf) {
            toast({ title: '¡Advertencia!', description: 'Debe seleccionar un Profesional y un Rol.', variant: 'warning' });
            return;
        }

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

        setProfessionalPendingRoleSelection(null);
        setSelectedRoleForPendingProf('');
        if (errors.profesionales) {
            setErrors(prev => ({ ...prev, profesionales: null }));
        }
    };

    const handleCancelAddProfessional = () => {
        setProfessionalPendingRoleSelection(null);
        setSelectedRoleForPendingProf('');
    };

    const handleRemoveProfessional = (idToRemove) => {
        setFormData(prev => ({
            ...prev,
            selectedProfessionals: prev.selectedProfessionals.filter(p => String(p.idProfesional) !== String(idToRemove))
        }));
        if (errors.profesionales) {
            setErrors(prev => ({ ...prev, profesionales: null }));
        }
    };

    // --- Schedule Slots Handlers ---

    const handleDayToggle = (idDia, isChecked) => {
        setFormData(prev => {
            let slots = [...prev.selectedScheduleSlots];

            if (isChecked) {
                if (!slots.some(s => s.idDia === idDia)) {
                    slots.push({ idDia, hora_inicio: '', hora_fin: '' });
                }
            } else {
                slots = slots.filter(s => s.idDia !== idDia);
                setErrors(err => {
                    const cleaned = { ...err };
                    delete cleaned[`horarios.${idDia}.hora_inicio`];
                    delete cleaned[`horarios.${idDia}.hora_fin`];
                    return cleaned;
                });
            }

            return { ...prev, selectedScheduleSlots: slots };
        });

        setErrors(err => ({ ...err, horarios: null }));
    };

    const handleTimeChange = (idDia, field, value) => {
        setFormData(prev => {
            const slots = prev.selectedScheduleSlots.map(slot =>
                slot.idDia === idDia
                    ? { ...slot, [field]: value }
                    : slot
            );
            return { ...prev, selectedScheduleSlots: slots };
        });
        const key = `horarios.${idDia}.${field}`;
        setErrors(err => ({ ...err, [key]: null }));
        setErrors(err => ({ ...err, horarios: null }));
    };

    // --- Form Submission ---
    const handleSubmit = async e => {
        e.preventDefault();
        show();
        setErrors({});

        const currentErrors = {};
        if (!formData.idCurso) currentErrors.idCurso = ['Debe seleccionar un Curso.'];
        if (!formData.idAula) currentErrors.idAula = ['Debe seleccionar un Aula.'];
        if (formData.selectedProfessionals.length === 0) currentErrors.profesionales = ['Debe asignar al menos un Profesional.'];
        if (formData.selectedScheduleSlots.length === 0) currentErrors.horarios = ['Debe asignar al menos un Día y Horario.'];

        formData.selectedScheduleSlots.forEach(slot => {
            if (!slot.hora_inicio) currentErrors[`horarios.${slot.dia}.hora_inicio`] = [`La hora de inicio es obligatoria para ${slot.dia}.`];
            if (!slot.hora_fin) currentErrors[`horarios.${slot.dia}.hora_fin`] = [`La hora de fin es obligatoria para ${slot.dia}.`];
            if (slot.hora_inicio && slot.hora_fin && slot.hora_inicio >= slot.hora_fin) {
                currentErrors[`horarios.${slot.dia}.hora_fin`] = [`La hora de fin debe ser posterior a la hora de inicio en ${slot.dia}.`];
            }
        });

        if (professionalPendingRoleSelection) {
            currentErrors.profesionales = [`Confirme o cancele la asignación de ${professionalPendingRoleSelection.nombreCompleto} antes de guardar.`];
        }


        if (Object.keys(currentErrors).length > 0) {
            setErrors(currentErrors);
            hide();
            toast({ title: '¡Error!', description: 'Revisa los datos ingresados.', variant: 'error' });
            console.warn("Client-side validation errors:", currentErrors);
            return;
        }


        const payload = {
            idCurso: Number(formData.idCurso),
            idAula: Number(formData.idAula),
            docentes: formData.selectedProfessionals.map(p => ({
                idProfesional: p.idProfesional,
                idRolDocente: Number(p.role)
            })),
            hora_inicio: formData.selectedScheduleSlots.length
                ? formData.selectedScheduleSlots[0].hora_inicio + ':00'
                : null,
            dias: formData.selectedScheduleSlots.map(s => ({
                idDia: Number(s.idDia),
                hora_inicio: s.hora_inicio + ':00',
                hora_fin: s.hora_fin + ':00',
            })),
            hora_fin: formData.selectedScheduleSlots.length
                ? formData.selectedScheduleSlots[0].hora_fin + ':00'
                : null
        };

        try {
            if (isEditMode) {
                await api.put(`/Horario/${initialData.idHorario}`, payload);
            } else {
                await api.post('/Horario', payload);
            }
            hide();
            setErrors({});
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

            } else if (err.response?.status == 409 && err.response.data.message == "Teacher, has reached the maximum number of teaching and tutoring assignments.") {
                toast({ title: '¡Error!', description: 'El docente, ha alcanzado el numero maximo de asignaciones como Mentor y tutor', variant: 'error' });
            } else if (err.response?.status == 409 && err.response.data.message == "Teacher, busy at that time") {
                toast({ title: '¡Error!', description: 'El docente esta ocupado en ese horario.', variant: 'error' });
            } else if (err.response?.status == 409 && err.response.data.message != "Teacher, has reached the maximum number of teaching and tutoring assignments." && err.response.data.message != "Teacher, busy at that time") {
                toast({ title: '¡Error!', description: 'Conflicto de horario o profesional.', variant: 'error' });
            } else {
                console.error(err);
                toast({ title: '¡Error!', description: 'Error inesperado al guardar.', variant: 'error' });
            }
        }
    };

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
                                options={[{ value: '', label: 'Seleccione Curso mediante su Codigo', disabled: true },
                                ...courses.map(c => ({ value: c.idCurso, label: c.codigoGrupo }))]}
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
                                value=""
                                onChange={handleSelectProfessionalToAdd}
                                options={[{ value: '', label: 'Seleccione Profesional para asignar.', disabled: true },
                                ...availableProfessionalsForAssignment.map(p => ({ value: p.idProfesional, label: p.nombreCompleto }))]}
                                disabled={!!professionalPendingRoleSelection || professionals.length === 0} // Disable if adding is in progress or no professionals loaded
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
                                                required
                                            />
                                        </div>
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
                        </div>


                        {/* Sección para Horarios (ocupa dos columnas) */}
                        <div className="space-y-4 md:col-span-2">
                            <InputLabel value="Horarios de Clase" />
                            {errors.horarios && typeof errors.horarios === 'string' && (
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
                                                    <span>Hora de Inicio:</span>
                                                    <input
                                                        type="time"
                                                        value={slot.hora_inicio}
                                                        onChange={e => handleTimeChange(d.idDia, 'hora_inicio', e.target.value)}
                                                    />
                                                    <span>Hora de Fin:</span>
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
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel} disabled={!!professionalPendingRoleSelection}>
                            Cancelar
                        </CancelButton>
                        <ButtonGradient type="submit" disabled={!!professionalPendingRoleSelection}>
                            <Save className="h-4 w-4 mr-1" />
                            {isEditMode ? 'Guardar Cambios' : 'Crear Clase'}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
