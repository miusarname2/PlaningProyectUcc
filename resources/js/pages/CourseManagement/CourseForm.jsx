import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import TextTareaInput from "@/Components/TextTareaInput";
import { Save, XCircle } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function CourseForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    // State for dropdown data
    const [specialties, setSpecialties] = useState([]);
    const [programs, setPrograms] = useState([]);

    // Form state with proper initialData mapping
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        creditos: initialData?.creditos ?? "",
        horas: initialData?.horas ?? "",
        estado: initialData?.estado || "Activo",
        codigo: initialData?.codigo || "",
        // Map initialData.programas to array of IDs
        selectedPrograms: initialData?.programas
            ? initialData.programas.map(p => p.idPrograma)
            : []
    });
    const [errors, setErrors] = useState({});

    // Fetch specialties and programs
    useEffect(() => {
        api.get('/especialidad')
            .then(res => setSpecialties(res.data || []))
            .catch(err => console.error('Error loading specialties', err));
        api.get('/programa')
            .then(res => setPrograms(res.data || []))
            .catch(err => console.error('Error loading programs', err));
    }, []);

    const generateCodigo = async () => {
        try {
            const resp = await api.get("/curso");
            const next = resp.data.length + 1;
            return `C${String(next).padStart(3, "0")}`;
        } catch (e) {
            console.error("Error generating code:", e);
            return "";
        }
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Handlers for programs tags
    const handleSelectProgramToAdd = e => {
        const id = parseInt(e.target.value, 10);
        if (!id || formData.selectedPrograms.includes(id)) return;
        setFormData(prev => ({
            ...prev,
            selectedPrograms: [...prev.selectedPrograms, id]
        }));
        e.target.value = "";
        setErrors(prev => ({ ...prev, selectedPrograms: null }));
    };

    const handleRemoveProgram = idToRemove => {
        setFormData(prev => ({
            ...prev,
            selectedPrograms: prev.selectedPrograms.filter(id => id !== idToRemove)
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            creditos: Number(formData.creditos),
            horas: Number(formData.horas),
            estado: formData.estado,
            programas: formData.selectedPrograms
        };

        if (!isEditMode) {
            payload.codigo = await generateCodigo();
        }

        // In edit mode keep existing code
        if (isEditMode) {
            payload.codigo = initialData.codigo;
        }

        try {
            if (isEditMode) await api.put(`/curso/${initialData.idCurso}`, payload);
            else await api.post('/curso', payload);
            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                console.error('Error saving course:', error);
            }
        }
    };

    // Filter available programs to exclude selected ones
    const availableProgramOptions = programs
        .filter(p => !formData.selectedPrograms.includes(p.idPrograma))
        .map(p => ({ value: p.idPrograma, label: p.nombre }));

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre del curso"
                                required
                                error={errors.nombre}
                            />
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="space-y-2">
                        <InputLabel htmlFor="descripcion" value="Descripción" />
                        <TextTareaInput
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleChange}
                            placeholder="Ingrese la descripción"
                            rows={4}
                            required
                            className={errors.descripcion ? "border-red-500" : ""}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Créditos */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="creditos" value="Créditos" />
                            <TextInput
                                id="creditos"
                                name="creditos"
                                type="number"
                                value={formData.creditos}
                                onChange={handleChange}
                                placeholder="Ej: 3"
                                required
                                error={errors.creditos}
                            />
                        </div>
                        {/* Horas */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="horas" value="Horas" />
                            <TextInput
                                id="horas"
                                name="horas"
                                type="number"
                                value={formData.horas}
                                onChange={handleChange}
                                placeholder="Ej: 40"
                                required
                                error={errors.horas}
                            />
                        </div>

                        {/* Estado */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="estado" value="Estado" />
                            <SelectInput
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                options={[{ value: "Activo", label: "Activo" }, { value: "Inactivo", label: "Inactivo" }]}
                                required
                                error={errors.estado}
                            />
                        </div>
                    </div>

                    {/* Programas */}
                    <div className="space-y-2 md:col-span-2">
                        <InputLabel htmlFor="addProgram" value="Programas" />
                        <SelectInput
                            id="addProgram"
                            value=""
                            onChange={handleSelectProgramToAdd}
                            options={[{ value: "", label: "Agregar Programa" }, ...availableProgramOptions]}
                        />
                        {errors.selectedPrograms && <div className="text-red-500 text-sm">{errors.selectedPrograms}</div>}
                        <div className="mt-2 flex flex-wrap items-center gap-2 border border-gray-300 p-2 rounded min-h-[40px]">
                            {formData.selectedPrograms.length === 0 && <span className="text-gray-500 text-sm">Ningún programa seleccionado.</span>}
                            {formData.selectedPrograms.map(id => {
                                const prog = programs.find(p => p.idPrograma === id);
                                return prog ? (
                                    <div key={id} className="inline-flex items-center border border-blue-200 rounded-md pl-2 py-1 pr-1 bg-blue-50">
                                        <span className="text-blue-700 text-sm font-medium">{prog.nombre}</span>
                                        <button type="button" onClick={() => handleRemoveProgram(id)} className="ml-1 p-0.5 text-blue-600 hover:text-blue-800 focus:outline-none rounded-sm">
                                            <XCircle size={14} />
                                        </button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    {/* Botones */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            {isEditMode ? "Guardar Cambios" : "Crear Curso"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}