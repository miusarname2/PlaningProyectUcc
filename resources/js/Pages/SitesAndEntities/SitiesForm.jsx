import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import TextTareaInput from "@/Components/TextTareaInput";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import ToggleSwitch from "@/Components/ToggleSwitch"; // lo vamos a crear
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function SitiesForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    // Estado para las ciudades
    const [cities, setCities] = useState([]);
    // Estado del formulario, se agrega el campo 'idCiudad'
    const [formData, setFormData] = useState({
        codigo: initialData?.codigoSede || "",
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        tipo: initialData?.tipo || "Fisica",
        acceso: initialData?.acceso || "",
        idCiudad: initialData?.idCiudad || "", // campo para la ciudad
    });
    const [errors, setErrors] = useState({});

    // Obtiene las ciudades desde '/ciudad'
    async function fetchCities() {
        try {
            const response = await api.get("/ciudad");
            (response.data).unshift({ idCiudad: "", nombre: "Seleccionar Ciudad." });
            setCities(response.data);
        } catch (error) {
            console.error("Error fetching cities:", error);
        }
    }

    useEffect(() => {
        fetchCities();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        console.log(name, value);
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = { ...formData };

            if (isEditMode) {
                await api.put(`/sede/${initialData?.id}`, payload);
            } else {
                const response = await api.get("/sede");
                const lengthRes = response.data.length;
                const nextCodeNumber = lengthRes + 1;
                const formattedNumber = String(nextCodeNumber).padStart(3, '0');
                payload.codigo = `S${formattedNumber}`;
                console.log(payload);
                await api.post("/sede", payload);
            }

            setErrors({});
            if (typeof onSubmitSuccess === "function") onSubmitSuccess();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
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

                        {/* Campo para seleccionar la ciudad */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="idCiudad" value="Ciudad" />
                            <SelectInput
                                id="idCiudad"
                                name="idCiudad"
                                value={formData.idCiudad}
                                onChange={handleChange}
                                options={cities.map((city) => ({
                                    value: city.idCiudad,
                                    label: city.nombre,
                                }))}
                                required
                            />
                        </div>

                        {/* Campo para seleccionar el tipo */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="tipo" value="Tipo" />
                            <SelectInput
                                id="tipo"
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                options={[
                                    { value: "Fisica", label: "Fisica" },
                                    { value: "Virtual", label: "Virtual" },
                                ]}
                                required
                            />
                        </div>

                        {/* Campo para Dirección/URL según el tipo */}
                        <div className="space-y-2 md:col-span-2">
                            {formData.tipo === "Fisica" ? (
                                <>
                                    <InputLabel htmlFor="acceso" value="Dirrecion/Url" />
                                    <TextInput
                                        id="acceso"
                                        name="acceso"
                                        value={formData.acceso}
                                        onChange={handleChange}
                                        placeholder="Ingrese la dirección"
                                        required
                                    />
                                </>
                            ) : (
                                <>
                                    <InputLabel htmlFor="acceso" value="Dirrecion/Url" />
                                    <TextInput
                                        id="acceso"
                                        name="acceso"
                                        value={formData.acceso}
                                        onChange={handleChange}
                                        placeholder="Ingrese la URL"
                                        required
                                    />
                                </>
                            )}
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