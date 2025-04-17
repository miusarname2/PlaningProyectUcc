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

export default function ClassroomForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const [sedes, setSedes] = useState([]);
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        estado: initialData?.estado || "Disponible",
        idSede: initialData?.idSede || "",
        capacidad: initialData?.capacidad || "",
        cantidadPasos: initialData?.cantidadPasos || ""
    });
    const [errors, setErrors] = useState({});

    // 1) Obtener la lista de sedes al montar el componente
    useEffect(() => {
        const fetchSedes = async () => {
            try {
                const response = await api.get("/sede");
                setSedes(response.data);
            } catch (error) {
                console.error("Error fetching sedes:", error);
            }
        };
        fetchSedes();
    }, []);

    // 2) Manejador genérico de cambios en inputs y textarea
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 3) Envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                estado: formData.estado,
                idSede: formData.idSede,
                capacidad: Number(formData.capacidad),
                cantidadPasos: Number(formData.cantidadPasos)
            };

            if (isEditMode) {
                await api.put(`/aula/${initialData.id}`, payload);
            } else {
                const response = await api.get("/aula");
                const lengthRes = response.data.length;
                const nextCodeNumber = lengthRes + 1;
                const formattedNumber = String(nextCodeNumber).padStart(3, '0');
                payload.codigo = `A${formattedNumber}`;
                await api.post("/aula", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving aula:", error);
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
                                placeholder="Ingrese el nombre"
                                required
                                error={errors.nombre}
                            />
                        </div>

                        {/* Campo Capacidad */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="capacidad" value="Capacidad" />
                            <TextInput
                                id="capacidad"
                                name="capacidad"
                                type="number"
                                value={formData.capacidad}
                                onChange={handleChange}
                                placeholder="Ingrese la capacidad"
                                required
                                error={errors.capacidad}
                            />
                        </div>

                        {/* Campo Pasos / Número de pasos */}
                        {/* <div className="space-y-2">
                            <InputLabel htmlFor="cantidadPasos" value="Número de pasos" />
                            <TextInput
                                id="cantidadPasos"
                                name="cantidadPasos"
                                type="number"
                                value={formData.cantidadPasos}
                                onChange={handleChange}
                                placeholder="Ingrese la cantidad de pasos"
                                required
                                error={errors.cantidadPasos}
                            />
                        </div> */}
                    </div>

                    {/* Descripción (textarea) */}
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
                        {/* Estado */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="estado" value="Estado" />
                            <SelectInput
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                options={[
                                    { value: "Disponible", label: "Disponible" },
                                    { value: "No disponible", label: "No disponible" },
                                ]}
                                required
                                error={errors.estado}
                            />
                        </div>

                        {/* Select de Sede */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idSede" value="Sede" />
                            <SelectInput
                                id="idSede"
                                name="idSede"
                                value={formData.idSede}
                                onChange={handleChange}
                                options={sedes.map((s) => ({
                                    value: s.idSede,
                                    label: s.nombre,
                                }))}
                                required
                                error={errors.idSede}
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            {isEditMode ? "Guardar Cambios" : "Crear Aula"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}