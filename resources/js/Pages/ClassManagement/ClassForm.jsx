import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import { useToast } from '@/lib/toast-context'
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function ClassForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const { toast } = useToast()
    const isEditMode = Boolean(initialData);
    console.log(isEditMode);

    // Master lists
    const [courses, setCourses] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [timeSlots, setTimeSlots] = useState([]);
    const [cities, setCities] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [aulas, setAulas] = useState([]);

    // Form state. We leave idSede & idAula initialized from initialData.
    const [formData, setFormData] = useState({
        idCurso: initialData?.idCurso || "",
        idProfesional: initialData?.idProfesional || "",
        idFranjaHoraria: initialData?.idFranjaHoraria || "",
        ciudad: "",              // will derive below if editing
        idSede: initialData?.idSede || "",
        idAula: initialData?.idAula || "",
        dia: initialData?.dia || "",
    });

    const [errors, setErrors] = useState({});

    // 1) Fetch all master lists on mount
    useEffect(() => {
        api.get("/curso").then(r => setCourses(r.data)).catch(console.error);
        api.get("/profesional").then(r => setProfessionals(r.data)).catch(console.error);
        api.get("/franjaHoraria").then(r => setTimeSlots(r.data)).catch(console.error);
        api.get("/ciudad").then(r => setCities(r.data)).catch(console.error);
        api.get("/sede").then(r => setSedes(r.data)).catch(console.error);
        api.get("/aula").then(r => setAulas(r.data)).catch(console.error);
    }, []);

    // 2) Derive `ciudad` automatically from initialData.idSede when editing
    useEffect(() => {
        if (isEditMode && sedes.length > 0 && formData.idSede) {
            const sel = sedes.find(s => String(s.idSede) === String(formData.idSede));
            if (sel) {
                setFormData(prev => ({ ...prev, ciudad: sel.idCiudad }));
            }
        }
    }, [isEditMode, sedes]);

    // 3) Compute dependent lists
    const availableSedes = sedes.filter(s => String(s.idCiudad) === String(formData.ciudad));
    const availableAulas = aulas.filter(a => String(a.idSede) === String(formData.idSede));

    // 4) Handle changes and reset downstream selects
    const handleChange = (e) => {
        const { name, value } = e.target;
        const update = { [name]: value };
        if (name === "ciudad") {
            update.idSede = "";
            update.idAula = "";
        }
        if (name === "idSede") {
            update.idAula = "";
        }
        setFormData(prev => ({ ...prev, ...update }));
    };

    // 5) Submit payload (PUT when editing, POST otherwise)
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            idCurso: Number(formData.idCurso),
            idProfesional: Number(formData.idProfesional),
            idFranjaHoraria: Number(formData.idFranjaHoraria),
            idAula: Number(formData.idAula),
            dia: formData.dia
        };
        try {
            if (isEditMode) {
                await api.put(`/Horario/${initialData.id}`, payload);
            } else {
                await api.post("/Horario", payload);
            }
            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (err) {
            if (err.response?.status == 422) {
                setErrors(err.response.data.errors || {});
                toast({
                    title: '¡Error!',
                    description: 'Existe un problema con los datos suministrado.',
                    variant: 'error',
                });
            } else if (err.response?.status == 409) {
                toast({
                    title: '¡Error!',
                    description: 'Existe un conflicto con la clase seleccionada.',
                    variant: 'error',
                });
            } else {
                console.error(err);
                toast({
                    title: '¡Error!',
                    description: 'Ha ocurrido un error inesperado.',
                    variant: 'error',
                });
            }
        }
    };

    const days = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado", "Domingo"];

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Curso */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idCurso" value="Curso" />
                            <SelectInput
                                id="idCurso"
                                name="idCurso"
                                value={formData.idCurso}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccione Curso.", disabled: true },
                                    ...courses.map(c => ({ value: c.idCurso, label: c.nombre }))
                                ]}
                                required
                                error={errors.idCurso}
                            />
                        </div>

                        {/* Profesional */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idProfesional" value="Profesional" />
                            <SelectInput
                                id="idProfesional"
                                name="idProfesional"
                                value={formData.idProfesional}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccione Profesional.", disabled: true },
                                    ...professionals.map(p => ({ value: p.idProfesional, label: p.nombreCompleto }))
                                ]}
                                required
                                error={errors.idProfesional}
                            />
                        </div>

                        {/* Franja Horaria */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idFranjaHoraria" value="Franja Horaria" />
                            <SelectInput
                                id="idFranjaHoraria"
                                name="idFranjaHoraria"
                                value={formData.idFranjaHoraria}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccione Franja Horaria.", disabled: true },
                                    ...timeSlots.map(f => ({ value: f.idFranjaHoraria, label: f.nombre }))
                                ]}
                                required
                                error={errors.idFranjaHoraria}
                            />
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="ciudad" value="Ciudad" />
                            <SelectInput
                                id="ciudad"
                                name="ciudad"
                                value={formData.ciudad}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccione Ciudad.", disabled: true },
                                    ...cities.map(c => ({ value: c.idCiudad, label: c.nombre }))
                                ]}
                                required
                                error={errors.ciudad}
                            />
                        </div>

                        {/* Sede */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idSede" value="Sede" />
                            <SelectInput
                                id="idSede"
                                name="idSede"
                                value={formData.idSede}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccione Sede.", disabled: true },
                                    ...availableSedes.map(s => ({ value: s.idSede, label: s.nombre }))
                                ]}
                                required
                                error={errors.idSede}
                            />
                        </div>

                        {/* Aula */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idAula" value="Aula" />
                            <SelectInput
                                id="idAula"
                                name="idAula"
                                value={formData.idAula}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccione Aula.", disabled: true },
                                    ...availableAulas.map(a => ({ value: a.idAula, label: a.nombre }))
                                ]}
                                required
                                error={errors.idAula}
                            />
                        </div>

                        {/* Día */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="dia" value="Día" />
                            <SelectInput
                                id="dia"
                                name="dia"
                                value={formData.dia}
                                onChange={handleChange}
                                options={days.map(d => ({ value: d, label: d }))}
                                required
                                error={errors.dia}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            {isEditMode ? "Guardar Cambios" : "Crear Clase"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
