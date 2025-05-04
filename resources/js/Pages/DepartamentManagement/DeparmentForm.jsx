import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import TextTareaInput from "@/Components/TextTareaInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function DeparmentForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();

    const [countries, setCountries] = useState([]);
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        idRegion: initialData?.region?.idRegion || "",
    });
    const [errors, setErrors] = useState({});

    const isEditMode = Boolean(initialData);

    async function fetchRegions() {
        try {
            const response = await api.get("/region");
            setCountries(response.data);
        } catch (error) {
            console.error("Error fetching countries:", error);
        }
    }

    useEffect(() => {
        fetchRegions();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                idRegion: formData.idRegion,
            };

            if (isEditMode) {
                console.log(initialData);
                await api.put(`/estado/${initialData?.id}`, payload);
            } else {
                console.log(payload);
                await api.post("/estado", payload);
            }

            setErrors({});
            if (typeof onSubmitSuccess == "function") onSubmitSuccess();
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
                        {/* Campo de nombre */}
                        <div className="space-y-2">
                            <label htmlFor="nombre" className="text-sm">Nombre</label>
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre"
                                required
                            />
                        </div>

                        {/* Campo para seleccionar país */}
                        <div className="space-y-2">
                            <label htmlFor="idRegion" className="text-sm">Region</label>
                            <SelectInput
                                id="idPais"
                                name="idRegion"
                                value={formData.idRegion}
                                onChange={handleChange}
                                options={countries.map((region) => ({
                                    value: region.idRegion,
                                    label: region.nombre,
                                }))}
                                required
                            />
                        </div>

                        {/* Campo de descripción */}
                        <div className="space-y-4 md:col-span-2">
                            <label htmlFor="descripcion" className="text-sm">Descripción</label>
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
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cerrar</CancelButton>
                        <ButtonGradient type="submit">
                            {isEditMode ? "Guardar Cambios" : "Crear Registro"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
