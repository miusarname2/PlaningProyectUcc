import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHour, startMinute, startSecond = "0"] = startTime.split(":").map(Number);
    const [endHour, endMinute, endSecond = "0"] = endTime.split(":").map(Number);

    const startDate = new Date(1970, 0, 1, startHour, startMinute, startSecond);
    const endDate = new Date(1970, 0, 1, endHour, endMinute, endSecond);

    let diff = (endDate - startDate) / 60000; // diferencia en minutos
    if (diff < 0) {
        // Si la diferencia es negativa, asumimos que la hora de fin es del día siguiente
        diff += 24 * 60;
    }

    return diff;
};

// Función para generar el código automáticamente en modo creación
const generateCodigo = async (api) => {
    try {
        const response = await api.get("/franjaHoraria");
        const lengthRes = response.data.length;
        const nextCodeNumber = lengthRes + 1;
        const formattedNumber = String(nextCodeNumber).padStart(3, '0');
        return `FO${formattedNumber}`;
    } catch (error) {
        console.error("Error generating code:", error);
        return "";
    }
};

export default function SlotForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        horaInicio: initialData?.horaInicio || "",
        horaFin: initialData?.horaFin || "",
        tipo: initialData?.tipo || "Regular",
        estado: initialData?.estado || "Activo",
        codigo: initialData?.codigo || ""
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Calcular la duración en minutos basándose en las horas de inicio y fin
        const duracionMinutos = calculateDuration(formData.horaInicio, formData.horaFin);

        const payload = {
            nombre: formData.nombre,
            horaInicio: formData.horaInicio,
            horaFin: formData.horaFin,
            duracionMinutos,
            tipo: formData.tipo,
            estado: formData.estado,
        };

        // Si es creación, se genera el código automáticamente
        if (!isEditMode) {
            payload.codigo = await generateCodigo(api);
        }

        try {
            if (isEditMode) {
                await api.put(`/franjaHoraria/${initialData.id}`, payload);
            } else {
                await api.post("/franjaHoraria", payload);
            }
            setErrors({});
            if (typeof onSubmitSuccess === "function") onSubmitSuccess();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving franjaHoraria:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">{isEditMode ? "Editar Horario" : "Crear Horario"}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campo: Nombre */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre"
                                required
                                error={errors.nombre}
                            />
                        </div>

                        {/* Campo: Hora de inicio */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="horaInicio" value="Hora de inicio" />
                            <TextInput
                                id="horaInicio"
                                name="horaInicio"
                                type="time"
                                value={formData.horaInicio}
                                onChange={handleChange}
                                required
                                error={errors.horaInicio}
                            />
                        </div>

                        {/* Campo: Hora de fin */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="horaFin" value="Hora de fin" />
                            <TextInput
                                id="horaFin"
                                name="horaFin"
                                type="time"
                                value={formData.horaFin}
                                onChange={handleChange}
                                required
                                error={errors.horaFin}
                            />
                        </div>

                        {/* Campo: Tipo */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="tipo" value="Tipo" />
                            <SelectInput
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                options={[
                                    { value: "Fin de semana", label: "Fin de semana" },
                                    { value: "Regular", label: "Regular" },
                                    { value: "Break", label: "Break" },
                                    { value: "Tarde", label: "Tarde" },
                                    { value: "Tarde Noche", label: "Tarde Noche" },
                                ]}
                                required
                                error={errors.tipo}
                            />
                        </div>

                        {/* Campo: Estado */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="estado" value="Estado" />
                            <SelectInput
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                options={[
                                    { value: "Activo", label: "Activo" },
                                    { value: "Inactivo", label: "Inactivo" },
                                ]}
                                required
                                error={errors.estado}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Slot"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}