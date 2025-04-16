import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function CityForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();

    const [formData, setFormData] = useState({
        codigoCiudad: initialData?.codigoCiudad || "",
        idCiudad: initialData?.id || "",
        nombre: initialData?.nombre || "",
        pais: initialData?.pais || "",
        idPais: initialData?.idPais || "",
        region: initialData?.region || "",
        idRegion: initialData?.idRegion || "",
        codigoPostal: initialData?.codigoPostal || "",
    });

    const [errors, setErrors] = useState({});
    const isEditMode = Boolean(initialData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                idCiudad: formData.idCiudad,
                nombre: formData.nombre,
                pais: formData.pais,
                region: formData.region,
                codigoPostal: formData.codigoPostal,
            };

            if (isEditMode) {
                await api.put(`/ciudad/${formData.idCiudad}`, payload);
                await api.put(`/region/${formData.idRegion}`, {
                    nombre: formData.region
                });
                await api.put(`/pais/${formData.idPais}`, {
                    nombre: formData.pais
                });
            } else {
                await api.post("/ciudad", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving city:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* {isEditMode && (
                            <div className="space-y-2">
                                <InputLabel htmlFor="idCiudad" value="ID Ciudad" className="text-sm" />
                                <TextInput
                                    id="idCiudad"
                                    name="idCiudad"
                                    value={formData.codigoCiudad}
                                    onChange={handleChange}
                                    placeholder="Ej: 101"
                                    required
                                />
                            </div>
                         )}  */}

                        <div className="space-y-2">
                            <InputLabel htmlFor="nombre" value="Nombre de la ciudad" className="text-sm" />
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Madrid"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="pais" value="País" className="text-sm" />
                            <TextInput
                                id="pais"
                                name="pais"
                                value={formData.pais}
                                onChange={handleChange}
                                placeholder="Ej: España"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="region" value="Región" className="text-sm" />
                            <TextInput
                                id="region"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                placeholder="Ej: Andalucía"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="codigoPostal" value="Código Postal" className="text-sm" />
                            <TextInput
                                id="codigoPostal"
                                name="codigoPostal"
                                value={formData.codigoPostal}
                                onChange={handleChange}
                                placeholder="Ej: 28001"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cerrar</CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Ciudad"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
