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

    console.log(initialData);
    const [formData, setFormData] = useState({
        codigoCiudad: initialData?.codigoCiudad || "",
        idCiudad: initialData?.id || "",
        nombre: initialData?.nombre || "",
        pais: initialData?.pais || "",
        idPais: initialData?.idPais || "",
        region: initialData?.region || "",
        estado: initialData?.estado || "",
        codigoPostal: initialData?.codigoPostal || "",
    });

    const [errors, setErrors] = useState({});
    const [estados, setEstados] = useState([]);
    const [countries, setCountries] = useState([]);
    const [regions, setRegions] = useState([]);
    const isEditMode = Boolean(initialData);

    // Fetch countries and regions
    useEffect(() => {
        async function fetchCountries() {
            try {
                const response = await api.get("/pais");
                setCountries(response.data);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        }
        fetchCountries();
    }, []);

    // Update regions when the country changes
    useEffect(() => {
        const selectedCountry = countries.find((country) => country.idPais === parseInt(formData.pais));
        setRegions(selectedCountry?.regiones || []);
        setFormData((prev) => ({ ...prev, region: "", estado: "" })); // Reinicia región y estado
        setEstados([]);
    }, [formData.pais, countries]);

    useEffect(() => {
        const selectedRegion = regions.find((region) => region.idRegion === parseInt(formData.region));
        setEstados(selectedRegion?.estados || []);
        setFormData((prev) => ({ ...prev, estado: "" })); // Reinicia estado
    }, [formData.region, regions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const payload = {
                nombre: formData.nombre,
                codigoPostal: formData.codigoPostal,
                idRegion: parseInt(formData.region),
                idEstado: parseInt(formData.estado),
            };

            if (isEditMode) {
                await api.put(`/ciudad/${formData.idCiudad}`, payload);
                await api.put(`/region/${formData.region}`, {
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
                            <SelectInput
                                id="pais"
                                name="pais"
                                value={formData.pais}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccionar país." },
                                    ...countries.map((country) => ({
                                        value: country.idPais,
                                        label: country.nombre,
                                    })),
                                ]}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="region" value="Región" className="text-sm" />
                            <SelectInput
                                id="region"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccionar región." },
                                    ...regions.map((region) => ({
                                        value: region.idRegion,
                                        label: region.nombre,
                                    })),
                                ]}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="estado" value="Departamento" className="text-sm" />
                            <SelectInput
                                id="estado"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Seleccionar Departamento." },
                                    ...estados.map((estado) => ({
                                        value: estado.idEstado,
                                        label: estado.nombre,
                                    })),
                                ]}
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
