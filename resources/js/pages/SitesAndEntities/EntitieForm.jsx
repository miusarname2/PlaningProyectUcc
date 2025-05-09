import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import TextTareaInput from "@/Components/TextTareaInput";
import ToggleSwitch from "@/Components/ToggleSwitch"; // lo vamos a crear
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function EntitieForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        contacto: initialData?.contacto || "",
        descripcion: initialData?.descripcion || "",
        estado: initialData?.estado || "Activo",
    });
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
                await api.put(`/entidad/${initialData.id}`, payload);
            } else {
                // 1. Obtener todas las sedes
                const response = await api.get("/entidad");
                const sedes = response.data; // Array de objetos con { codigo: "S001", ... }

                // 2. Extraer los números existentes
                const numerosExistentes = sedes
                    .map(sede => {
                        const match = sede.codigo.match(/^S(\d{3})$/);
                        return match ? parseInt(match[1], 10) : null;
                    })
                    .filter(n => n !== null); // Eliminamos posibles null

                // 3. Encontrar el siguiente número libre
                let siguiente = 1;
                const numerosSet = new Set(numerosExistentes);
                while (numerosSet.has(siguiente)) {
                    siguiente++;
                }

                // 4. Formatear a tres dígitos
                const formattedNumber = String(siguiente).padStart(3, "0");
                payload.codigo = `ENT${formattedNumber}`;

                await api.post("/entidad", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status == 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving record:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Campo para el nombre */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="nombre" value="Nombre" />
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre"
                                required
                            />
                        </div>

                        {/* Campo para el contacto */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="contacto" value="Contacto" />
                            <TextInput
                                id="contacto"
                                name="contacto"
                                value={formData.contacto}
                                onChange={handleChange}
                                placeholder="Ingrese el contacto"
                                required
                            />
                        </div>

                        {/* Campo para la descripción (ocupa dos columnas) */}
                        <div className="space-y-2 md:col-span-2">
                            <InputLabel htmlFor="descripcion" value="Descripción" />
                            <TextTareaInput
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Ingrese la descripción"
                                rows={4}
                                required
                            />
                        </div>

                        {/* Campo para el estado */}
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
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            {isEditMode ? "Guardar Cambios" : "Crear Registro"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
