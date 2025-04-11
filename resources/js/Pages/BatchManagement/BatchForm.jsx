import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function BatchForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [programOptions, setProgramOptions] = useState([]);

    const [formData, setFormData] = useState({
        id: initialData?.id || "",
        name: initialData?.name || "",
        programId: initialData?.programId || "",
        status: initialData?.status || "Próximamente",
        startDate: initialData?.startDate || "",
        endDate: initialData?.endDate || "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Traer programas disponibles desde API
        const fetchPrograms = async () => {
            try {
                const response = await api.get("/programa"); // Ajusta si tu endpoint es diferente
                const options = response.data.map((program) => ({
                    value: program.idPrograma,
                    label: program.nombre,
                }));
                setProgramOptions(options);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        fetchPrograms();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };

            if (isEditMode) {
                await api.put(`/batch/${formData.id}`, payload);
            } else {
                await api.post("/batch", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving batch:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Añadir nuevo lote</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {!isEditMode && (
                            <div className="space-y-2">
                                <InputLabel htmlFor="id" value="ID de lote" />
                                <TextInput
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    placeholder="Introducir ID de lote"
                                    required
                                    error={errors.id}
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <InputLabel htmlFor="name" value="Nombre del lote" />
                            <TextInput
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Introduzca el nombre del lote"
                                required
                                error={errors.name}
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="programId" value="Programa" />
                            <SelectInput
                                id="programId"
                                name="programId"
                                value={formData.programId}
                                onChange={handleChange}
                                options={programOptions}
                                required
                                error={errors.programId}
                                placeholder="Seleccionar programa"
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="status" value="Estado" />
                            <SelectInput
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[{ value: "Próximamente", label: "Próximamente" }]}
                                
                                error={errors.status}
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="startDate" value="Fecha de inicio" />
                            <TextInput
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleChange}
                                required
                                error={errors.startDate}
                                placeholder="dd/mm/aaaa"
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="endDate" value="Fecha final" />
                            <TextInput
                                id="endDate"
                                name="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={handleChange}
                                required
                                error={errors.endDate}
                                placeholder="dd/mm/aaaa"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Lote"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
