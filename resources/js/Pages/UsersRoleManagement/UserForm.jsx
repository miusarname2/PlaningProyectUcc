import { useState } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function UserForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const [formData, setFormData] = useState({
        name: initialData?.nombreCompleto || "",
        email: initialData?.email || "",
        role: initialData?.roles?.[0]?.nombre || "",
        status: initialData?.estado === "Activo" ? "Activo" : "Inactivo",
    });
    const [errors, setErrors] = useState({});
    const isEditMode = Boolean(initialData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!isEditMode) {
                if (formData.password !== formData.confirmPassword) {
                    setErrors({ confirmPassword: ["Las contraseñas no coinciden."] });
                    return;
                }

                const payload = {
                    username: formData.name,
                    nombreCompleto: formData.name,
                    email: formData.email,
                    estado: formData.status,
                    password: formData.password,
                };

                const response = await api.post("/user", payload);

                setErrors({}); 
                onSubmitSuccess?.();
                onCancel();
            } else {
                const payload = {
                    nombreCompleto: formData.name,
                    email: formData.email,
                    estado: formData.status,
                    // roles: [{ nombre: formData.role }],
                };

                const response = await api.put(`http://127.0.0.1:8000/api/user/${initialData.id}`, payload);
                console.log("Usuario actualizado con éxito:", response.data);

                setErrors({});
                onSubmitSuccess?.(); 
                onCancel(); 
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Errores de validación:", error.response.data.errors);
            } else {
                console.error("Error al guardar usuario:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <InputLabel
                                htmlFor="name"
                                value="Full Name"
                                className="text-sm"
                            />
                            <TextInput
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel
                                htmlFor="email"
                                value="Email Address"
                                className="text-sm"
                            />
                            <TextInput
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}

                        </div>

                        <div className="space-y-2">
                            <InputLabel
                                htmlFor="role"
                                value="Role"
                                className="text-sm"
                            />
                            <SelectInput
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                options={[
                                    { value: "", label: "Select a role" },
                                    {
                                        value: "Administrator",
                                        label: "Administrator",
                                    },
                                    { value: "Teacher", label: "Teacher" },
                                    { value: "Student", label: "Student" },
                                ]}
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel
                                htmlFor="status"
                                value="Status"
                                className="text-sm"
                            />
                            <SelectInput
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                options={[
                                    { value: "Activo", label: "Activo" },
                                    { value: "Inactivo", label: "Inactivo" },
                                ]}
                            />
                        </div>

                        {!isEditMode && (
                            <>
                                <div className="space-y-2">
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password"
                                        className="text-sm"
                                    />
                                    <TextInput
                                        id="password"
                                        name="password"
                                        type="password"
                                        value={formData.password || ""}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        required
                                    />

                                </div>

                                <div className="space-y-2">
                                    <InputLabel
                                        htmlFor="confirmPassword"
                                        value="Confirm Password"
                                        className="text-sm"
                                    />
                                    <TextInput
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        value={formData.confirmPassword || ""}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        required
                                    />
                                    {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword[0]}</p>}

                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cerrar</CancelButton>
                        <ButtonGradient
                            type="submit"
                        // onClick={() => router.visit(exitTo)}
                        >
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Usuario"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
