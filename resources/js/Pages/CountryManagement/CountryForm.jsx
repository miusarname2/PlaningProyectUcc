import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function CountryForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const [formData, setFormData] = useState({
        id: initialData?.id || "",
        name: initialData?.name || "",
        country: initialData?.country || "Colombia",
        region: initialData?.region || "",
        postalCode: initialData?.postalCode || "",
        status: initialData?.status || "Activo",
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
                id: formData.id,
                name: formData.name,
                country: formData.country,
                region: formData.region,
                postalCode: formData.postalCode,
                status: formData.status,
            };

            if (isEditMode) {
                await api.put(`/city/${formData.id}`, payload);
            } else {
                await api.post("/city", payload);
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
                        {!isEditMode && (
                            <div className="space-y-2">
                                <InputLabel htmlFor="id" value="City ID" className="text-sm" />
                                <TextInput
                                    id="id"
                                    name="id"
                                    value={formData.id}
                                    onChange={handleChange}
                                    placeholder="Enter city ID"
                                    required
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <InputLabel htmlFor="name" value="City Name" className="text-sm" />
                            <TextInput
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter city name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="country" value="Country" className="text-sm" />
                            <TextInput
                                id="country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="Enter country"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="region" value="Region" className="text-sm" />
                            <TextInput
                                id="region"
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                                placeholder="Enter region"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="postalCode" value="Postal Code" className="text-sm" />
                            <TextInput
                                id="postalCode"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                placeholder="e.g. 28001-28080"
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="status" value="Status" className="text-sm" />
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
