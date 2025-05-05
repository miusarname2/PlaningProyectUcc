import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import TextTareaInput from "@/Components/TextTareaInput";
import { Save, X } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function ProgrammeForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        id: initialData?.id || "",
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        duration: initialData?.duration || "",
        durationUnit: initialData?.durationUnit || "months",
        estado: initialData?.estado || "Activo",
        duracion: initialData?.duracion || 0,
        codigo: initialData?.codigo ,
    });

    const [specialties, setSpecialties] = useState([]);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };

            if (isEditMode) {
                await api.put(`/programa/${formData.id}`, payload);
            } else {
                await api.post("/programa", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving programme:", error);
            }
        }
    };

    // Obtener especialidades al cargar el formulario
    useEffect(() => {
        async function fetchSpecialties() {
            try {
                const response = await api.get("/especialidad");
                setSpecialties(response.data);
            } catch (error) {
                console.error("Error fetching specialties:", error);
            }
        }

        fetchSpecialties();
    }, []);

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-gray-200">
            <div className="p-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {!isEditMode && (
                                <div className="space-y-2">
                                    <InputLabel htmlFor="id" value="Sigla del programa" />
                                    <TextInput
                                        id="id"
                                        name="codigo"
                                        value={formData.codigo}
                                        onChange={handleChange}
                                        placeholder="Introduzca la sigla del programa"
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <InputLabel htmlFor="name" value="Nombre del programa" />
                                <TextInput
                                    id="name"
                                    name="nombre"
                                    value={formData.nombre}
                                    onChange={handleChange}
                                    placeholder="Introduzca el nombre del programa"
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <InputLabel htmlFor="description" value="Descripción" />
                                <TextTareaInput
                                    id="description"
                                    name="descripcion"
                                    value={formData.descripcion}
                                    onChange={handleChange}
                                    placeholder="Introduzca la descripción del programa..."
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <InputLabel htmlFor="status" value="Estado" />
                                <SelectInput
                                    id="status"
                                    name="estado"
                                    value={formData.estado}
                                    onChange={handleChange}
                                    options={[
                                        { value: "Activo", label: "Activo" },
                                        { value: "Inactivo", label: "Inactivo" },
                                    ]}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                            <ButtonGradient type="submit">
                                <Save className="h-4 w-4 mr-2" />
                                {isEditMode ? "Guardar Cambios" : "Crear Programa"}
                            </ButtonGradient>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
