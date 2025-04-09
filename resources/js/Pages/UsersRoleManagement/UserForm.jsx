import { useState } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";

export default function UserForm({ onCancel, initialData = null }) {
    const [formData, setFormData] = useState({
        name: initialData?.nombreCompleto || "",
        email: initialData?.email || "",
        role: initialData?.roles?.[0]?.nombre || "",
        status: initialData?.estado === "activo" ? "Active" : "Inactive",
    });
    const isEditMode = Boolean(initialData);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(
            isEditMode ? "Editando usuario:" : "Creando usuario:",
            formData
        );
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
                                value={formData.estado}
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
                                </div>
                            </>
                        )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cerrar</CancelButton>
                        <ButtonGradient
                            type="submit"
                            onClick={() => router.visit(exitTo)}
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
