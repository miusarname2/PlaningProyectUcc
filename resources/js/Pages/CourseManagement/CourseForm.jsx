import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import TextTareaInput from "@/Components/TextTareaInput";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function CourseForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        creditos: initialData?.creditos ?? "",
        horas: initialData?.horas ?? "",
        estado: initialData?.estado || "Activo",
        codigo: initialData?.codigo || "",
    });

    const [errors, setErrors] = useState({});

    // Auto‑genera el código solo en creación
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            creditos: Number(formData.creditos),
            horas: Number(formData.horas),
            estado: formData.estado,
        };

        if (!isEditMode) {
            payload.codigo = await generateCodigo();
        }

        try {
            if (isEditMode) {
                await api.put(`/curso/${initialData.id}`, payload);
            } else {
                await api.post("/curso", payload);
            }
            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving course:", error);
            }
        }
    };

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
                                options={[
                                    { value: "Activo", label: "Activo" },
                                    { value: "Inactivo", label: "Inactivo" },
                                ]}
                                required
                                error={errors.estado}
                            />
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