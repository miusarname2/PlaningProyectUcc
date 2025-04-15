import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import ToggleSwitch from "@/Components/ToggleSwitch"; // lo vamos a crear
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function ProfessonalForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const isEditMode = Boolean(initialData);

    function fromBase64(base64) {
        return decodeURIComponent(escape(atob(base64)));
    }

    const [formData, setFormData] = useState({
        nombreCompleto: initialData?.nombreCompleto || "",
        email: initialData?.email || "",
        titulo: initialData?.titulo || "",
        experiencia: parseInt(initialData?.experiencia) || "",
        estado: initialData?.estado || "Activo",
        perfil: initialData?.perfil || "",
    });

    const [errors, setErrors] = useState({});

    const toBase64 = (text) => {
        return btoa(unescape(encodeURIComponent(text)));
    }

    // Manejador para inputs de texto
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Manejador para la subida del PDF
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Verificar que sea PDF, se puede validar revisando file.type === "application/pdf"
            if (file.type !== "application/pdf") {
                alert("Por favor seleccione un archivo PDF.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                // reader.result contendrá el PDF en formato base64
                setFormData((prev) => ({ ...prev, perfil: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    // Permite eliminar el PDF previamente cargado
    const handleFileRemove = () => {
        setFormData((prev) => ({ ...prev, perfil: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            
            if (isEditMode) {
                await api.put(`/profesional/${initialData.id}`, payload);
            } else {
                const response = await api.get("/entidad");
                const lengthRes = response.data.length;
                const nextCodeNumber = lengthRes + 1;
                const formattedNumber = String(nextCodeNumber).padStart(3, '0');
                payload.codigo = `ENT${formattedNumber}`;
                payload.perfil = toBase64(toBase64(payload.perfil));
                await api.post("/profesional", payload);
            }

            setErrors({});
            if (typeof onSubmitSuccess == "function") onSubmitSuccess();
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
                        {/* Campo Nombre Completo */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="nombreCompleto" value="Nombre Completo" />
                            <TextInput
                                id="nombreCompleto"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleChange}
                                placeholder="Ingrese el nombre completo"
                                required
                            />
                        </div>

                        {/* Campo Email */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="email" value="Email" />
                            <TextInput
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Ingrese el email"
                                required
                            />
                        </div>

                        {/* Campo Cualificación (Título) */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="titulo" value="Cualificación" />
                            <TextInput
                                id="titulo"
                                name="titulo"
                                value={formData.titulo}
                                onChange={handleChange}
                                placeholder="Ingrese su cualificación o título"
                                required
                            />
                        </div>

                        {/* Campo Experiencia */}
                        <div className="space-y-2">
                            <InputLabel htmlFor="experiencia" value="Experiencia (años)" />
                            <TextInput
                                id="experiencia"
                                name="experiencia"
                                value={formData.experiencia}
                                onChange={handleChange}
                                placeholder="Ingrese años de experiencia"
                                required
                            />
                        </div>

                        {/* Campo Estado */}
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

                        {/* Campo para subir PDF (Perfil) */}
                        <div className="space-y-2 md:col-span-2">
                            <InputLabel htmlFor="perfil" value="Perfil (PDF)" />
                            {formData.perfil ? (
                                <div className="flex items-center gap-4">
                                    <a
                                        href={formData.perfil}
                                        download="perfil.pdf"
                                        className="text-blue-500 underline"
                                    >
                                        Descargar PDF
                                    </a>
                                    <button
                                        type="button"
                                        onClick={handleFileRemove}
                                        className="text-red-500 underline"
                                    >
                                        Eliminar PDF
                                    </button>
                                </div>
                            ) : (
                                <TextInput
                                    type="file"
                                    id="perfil"
                                    name="perfil"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    required={!isEditMode} // Si es creación, lo requerimos; en edición puede ser opcional
                                />
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