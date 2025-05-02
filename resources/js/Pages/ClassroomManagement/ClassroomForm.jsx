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

    // Todos las sedes y entidades propietarias extraídas
    const [sedes, setSedes] = useState([]);
    const [entidades, setEntidades] = useState([]);
    const [filteredSedes, setFilteredSedes] = useState([{ idSede: "", nombre: "Selecciona Sede" }]);

    // Filtros de usuario
    const [selectedEntity, setSelectedEntity] = useState(initialData?.propietario?.idEntidad || "");

    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        estado: initialData?.estado || "Disponible",
        idSede: initialData?.idSede || "",
        capacidad: initialData?.capacidad || "",
    });
    const [errors, setErrors] = useState({});

    // Fetch inicial de sedes y entidades
    useEffect(() => {
        const fetchSedes = async () => {
            try {
                const response = await api.get("/sede");
                setSedes(response.data);
                // Extraer entidades únicas
                const unique = response.data
                    .map(s => s.propietario)
                    .filter((e, i, arr) => arr.findIndex(x => x.idEntidad === e.idEntidad) === i);
                setEntidades([{ idEntidad: "", nombre: "Seleccionar entidad" }, ...unique]);
                // Inicializar filteredSedes si hay entidad por defecto
                if (selectedEntity) {
                    const filtered = response.data.filter(s => s.propietario.idEntidad === selectedEntity);
                    setFilteredSedes([{ idSede: "", nombre: "Selecciona Sede" }, ...filtered]);
                }
            } catch (error) {
                console.error("Error fetching sedes:", error);
            }
        };
        fetchSedes();
    }, []);

    // Manejador cambio entidad propietaria
    const handleEntityChange = (e) => {
        const entId = e.target.value;
        setSelectedEntity(entId);
        setFormData(prev => ({ ...prev, idSede: "" }));
        if (entId) {
            const filtered = sedes.filter(s => String(s.propietario.idEntidad) === entId);
            setFilteredSedes([{ idSede: "", nombre: "Selecciona Sede" }, ...filtered]);
        } else {
            // Solo placeholder cuando no hay entidad seleccionada
            setFilteredSedes([{ idSede: "", nombre: "Selecciona Sede" }]);
        }
    };

    // Manejador genérico de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                estado: formData.estado,
                idSede: formData.idSede,
                capacidad: Number(formData.capacidad),
            };

            if (isEditMode) {
                await api.put(`/aula/${initialData.id}`, payload);
            } else {
                const response = await api.get("/aula");
                const nextNum = response.data.length + 1;
                payload.codigo = `A${String(nextNum).padStart(3, '0')}`;
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

                        {/* Capacidad */}
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

                        {/* Seleccionar entidad propietaria */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="entityFilter" value="Filtrar por Entidad" />
                            <SelectInput
                                id="entityFilter"
                                name="entityFilter"
                                value={selectedEntity}
                                onChange={handleEntityChange}
                                options={entidades.map(ent => ({ value: ent.idEntidad, label: ent.nombre }))}
                            />
                        </div>

                        {/* Select de Sede filtrado */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idSede" value="Sede" />
                            <SelectInput
                                id="idSede"
                                name="idSede"
                                value={formData.idSede}
                                onChange={handleChange}
                                options={filteredSedes.map(s => ({ value: s.idSede, label: s.nombre }))}
                                required
                                error={errors.idSede}
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

                    {/* Estado */}
                    <div className="space-y-2 md:col-span-2">
                        <InputLabel htmlFor="estado" value="Estado" />
                        <SelectInput
                            id="estado"
                            name="estado"
                            value={formData.estado}
                            onChange={handleChange}
                            options={[
                                { value: "Disponible", label: "Disponible" },
                                { value: "No disponible", label: "No disponible" }
                            ]}
                            required
                            error={errors.estado}
                        />
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