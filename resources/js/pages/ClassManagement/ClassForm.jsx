import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import { useToast } from '@/lib/toast-context'
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";
import { useLoader } from "@/Components/LoaderProvider";

export default function ClassForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const { show, hide } = useLoader();
    const api = getApi();
    const { toast } = useToast();
    const isEditMode = Boolean(initialData);

    // Master lists
    const [courses, setCourses] = useState([]);
    const [professionals, setProfessionals] = useState([]);
    const [cities, setCities] = useState([]);
    const [sedes, setSedes] = useState([]);
    const [aulas, setAulas] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        idCurso: initialData?.idCurso || "",
        idProfesional: initialData?.idProfesional || "",
        ciudad: "",
        idSede: initialData?.idSede || "",
        idAula: initialData?.idAula || "",
        dia: initialData?.dia || "",
        hora_inicio: initialData?.hora_inicio ? initialData.hora_inicio.slice(0, 5) : "",
        hora_fin: initialData?.hora_fin ? initialData.hora_fin.slice(0, 5) : "",
    });

    const [errors, setErrors] = useState({});

    // Fetch master lists
    useEffect(() => {
        api.get('/curso').then(r => setCourses(r.data)).catch(console.error);
        api.get('/profesional').then(r => setProfessionals(r.data)).catch(console.error);
        api.get('/ciudad').then(r => setCities(r.data)).catch(console.error);
        api.get('/sede').then(r => setSedes(r.data)).catch(console.error);
        api.get('/aula').then(r => setAulas(r.data)).catch(console.error);
    }, []);

    // Derive ciudad
    useEffect(() => {
        if (isEditMode && sedes.length > 0 && formData.idSede) {
            const sel = sedes.find(s => String(s.idSede) === String(formData.idSede));
            if (sel) setFormData(prev => ({ ...prev, ciudad: sel.idCiudad }));
        }
    }, [isEditMode, sedes]);

    // Dependent lists
    const availableSedes = sedes.filter(s => String(s.idCiudad) === String(formData.ciudad));
    const availableAulas = aulas.filter(a => String(a.idSede) === String(formData.idSede));

    const handleChange = e => {
        const { name, value } = e.target;
        let update = { [name]: value };
        if (name === 'ciudad') update = { ciudad: value, idSede: '', idAula: '' };
        if (name === 'idSede') update.idAula = '';
        setFormData(prev => ({ ...prev, ...update }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        show();
        const payload = {
            idCurso: Number(formData.idCurso),
            idProfesional: Number(formData.idProfesional),
            idAula: Number(formData.idAula),
            dia: formData.dia,
            hora_inicio: formData.hora_inicio + ':00',
            hora_fin: formData.hora_fin + ':00',
        };

        try {
            if (isEditMode) {
                await api.put(`/Horario/${initialData.idHorario}`, payload);
            } else {
                await api.post('/Horario', payload);
            }
            hide();
            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (err) {
            hide();
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors || {});
                toast({ title: '¡Error!', description: 'Revisa los datos ingresados.', variant: 'error' });
            } else if (err.response?.status === 409) {
                toast({ title: '¡Error!', description: 'Conflicto de horario.', variant: 'error' });
            } else {
                console.error(err);
                toast({ title: '¡Error!', description: 'Error inesperado.', variant: 'error' });
            }
        }
    };

    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Curso */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idCurso" value="Curso" />
                            <SelectInput id="idCurso" name="idCurso" value={formData.idCurso} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Curso.', disabled: true },
                                ...courses.map(c => ({ value: c.idCurso, label: c.nombre }))]}
                                required error={errors.idCurso} />
                        </div>

                        {/* Profesional */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idProfesional" value="Profesional" />
                            <SelectInput id="idProfesional" name="idProfesional" value={formData.idProfesional} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Profesional.', disabled: true },
                                ...professionals.map(p => ({ value: p.idProfesional, label: p.nombreCompleto }))]}
                                required error={errors.idProfesional} />
                        </div>

                        {/* Ciudad */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="ciudad" value="Ciudad" />
                            <SelectInput id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Ciudad.', disabled: true },
                                ...cities.map(c => ({ value: c.idCiudad, label: c.nombre }))]}
                                required error={errors.ciudad} />
                        </div>

                        {/* Sede */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idSede" value="Sede" />
                            <SelectInput id="idSede" name="idSede" value={formData.idSede} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Sede.', disabled: true },
                                ...availableSedes.map(s => ({ value: s.idSede, label: s.nombre }))]}
                                required error={errors.idSede} />
                        </div>

                        {/* Aula */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idAula" value="Aula" />
                            <SelectInput id="idAula" name="idAula" value={formData.idAula} onChange={handleChange}
                                options={[{ value: '', label: 'Seleccione Aula.', disabled: true },
                                ...availableAulas.map(a => ({ value: a.idAula, label: a.nombre }))]}
                                required error={errors.idAula} />
                        </div>

                        {/* Día */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="dia" value="Día" />
                            <SelectInput id="dia" name="dia" value={formData.dia} onChange={handleChange}
                                options={days.map(d => ({ value: d, label: d }))}
                                required error={errors.dia} />
                        </div>

                        {/* Hora Inicio */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="hora_inicio" value="Hora de Inicio" />
                            <input
                                type="time"
                                id="hora_inicio"
                                name="hora_inicio"
                                value={formData.hora_inicio}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border p-2"
                            />
                            {errors.hora_inicio && <p className="text-red-500 text-sm">{errors.hora_inicio[0]}</p>}
                        </div>

                        {/* Hora Fin */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="hora_fin" value="Hora de Fin" />
                            <input
                                type="time"
                                id="hora_fin"
                                name="hora_fin"
                                value={formData.hora_fin}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border p-2"
                            />
                            {errors.hora_fin && <p className="text-red-500 text-sm">{errors.hora_fin[0]}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            {isEditMode ? 'Guardar Cambios' : 'Crear Clase'}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
