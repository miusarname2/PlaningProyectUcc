import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import ToggleSwitch from "@/Components/ToggleSwitch"; // lo vamos a crear
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function DailyForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        id: initialData?.id || "",
        name: initialData?.name || "",
        shortName: initialData?.shortName || "",
        status: initialData?.status || "Activo",
        isWeekend: initialData?.isWeekend || false,
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleToggle = (checked) => {
        setFormData((prev) => ({ ...prev, isWeekend: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = { ...formData };

            if (isEditMode) {
                await api.put(`/day/${formData.id}`, payload);
            } else {
                await api.post("/day", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving day:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {!isEditMode && (
                            <div className="space-y-2">
                                <InputLabel htmlFor="id" value="Día ID" />
                                <TextInput
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    placeholder="Introduzca el ID del día"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <InputLabel htmlFor="name" value="Nombre del día" />
                            <TextInput
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Introduzca el nombre del día"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="shortName" value="Nombre corto" />
                            <TextInput
                                id="shortName"
                                name="shortName"
                                value={formData.shortName}
                                onChange={handleChange}
                                placeholder="Ej: Lun, Mar, Mié"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="status" value="Estado" />
                            <SelectInput
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    { value: "Activo", label: "Activo" },
                                    { value: "Inactivo", label: "Inactivo" },
                                ]}
                                required
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <div className="flex items-center justify-between">
                                <InputLabel htmlFor="isWeekend" value="¿Es fin de semana?" />
                                <ToggleSwitch
                                    id="isWeekend"
                                    checked={formData.isWeekend}
                                    onChange={handleToggle}
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Este día {formData.isWeekend ? "no se considera laborable" : "se considera laborable"}.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Día"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
