import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import ButtonGradient from "@/Components/ButtonGradient";
import CheckboxInput from '@/Components/CheckboxInput';
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function ProfileForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const api = getApi();
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || "",
        descripcion: initialData?.descripcion || "",
        roles: initialData?.roles?.map(r => r.idRol) || [],
    });
    const [errors, setErrors] = useState({});
    const [allRoles, setAllRoles] = useState([]);
    const isEditMode = Boolean(initialData);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await api.get("/rol");
                const options = response.data.map(role => ({
                    label: role.nombre,
                    value: role.idRol
                }));
                setAllRoles(options);
            } catch (error) {
                console.error("Error fetching roles:", error);
            }
        };
        fetchRoles();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!isEditMode) {
                const payload = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                };

                const perfilResponse = await api.post("/perfil", payload);
                const idPerfil = perfilResponse.data.idPerfil;

                const rolesPayloads = formData.roles.map((idRol) => ({
                    idPerfil,
                    idRol
                }));
    
                await Promise.all(
                    rolesPayloads.map(data => api.post("/perfilRol", data))
                );

                setErrors({});
                onSubmitSuccess?.();
                onCancel();
            } else {
                const payload = {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                };
            
                await api.put(`/perfil/${initialData.idPerfil}`, payload);
            
                const idPerfil = initialData.idPerfil;
                const originalRoles = initialData.roles.map(r => r.idRol);
                const selectedRoles = formData.roles;
            
                const rolesToAdd = selectedRoles.filter(id => !originalRoles.includes(id));
                const rolesToRemove = originalRoles.filter(id => !selectedRoles.includes(id));
            
                await Promise.all(
                    rolesToAdd.map(idRol => api.post("/perfilRol", { idPerfil, idRol }))
                );
            
                await Promise.all(
                    rolesToRemove.map(idRol => 
                        api.delete(`/perfilRol/${idPerfil}/${idRol}`)

                    )
                );
            
                setErrors({});
                onSubmitSuccess?.();
                onCancel();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Errores de validación:", error.response.data.errors);
            } else {
                console.error("Error al guardar perfil:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <InputLabel htmlFor="nombre" value="Nombre" className="text-sm" />
                            <TextInput
                                id="nombre"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ingresa el nombre del perfil"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="descripcion" value="Descripcion" className="text-sm" />
                            <TextInput
                                id="descripcion"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Ingresa la descripcion del perfil"
                                required
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="roleId" value="Seleccionar Roles" className="text-sm" />
                            {allRoles.map(({ value, label }) => (
                                <CheckboxInput
                                    key={`rol_${value}`}
                                    id={`rol_${value}`}
                                    label={label}
                                    checked={formData.roles.includes(value)}
                                    onChange={() => {
                                        const updatedRoles = formData.roles.includes(value)
                                            ? formData.roles.filter((r) => r !== value) 
                                            : [...formData.roles, value]; 

                                        setFormData((prev) => ({
                                            ...prev,
                                            roles: updatedRoles,
                                        }));
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cerrar</CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Perfil"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}