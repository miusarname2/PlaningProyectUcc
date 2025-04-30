import { useState, useEffect } from "react";
import RolesList from "@/Components/RolesList";
import RolePlaceHolder from "@/Components/RolePlaceHolder";
import RoleForm from "@/Pages/UsersRoleManagement/RoleForm";
import { UserCog } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function PrincipalRole() {
    const [selectedRole, setSelectedRole] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [roles, setRoles] = useState([]);

    async function fetchRoles() {
        try {
            const api = getApi();
            const response = await api.get("/rol");
            setRoles(response.data);
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    }
    useEffect(() => {
        fetchRoles();
    }, []);

    const handleCreateClick = () => {
        setSelectedRole(null);
        setIsCreating(true);
    };

    const handleCancel = () => {
        setIsCreating(false);
        setSelectedRole(null);
    };

    const handleSubmitRole = (formData) => {
        fetchRoles();
        setIsCreating(false);
        setSelectedRole(null);
    };

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Permisos</h2>
                    <p className="text-gray-500">Crear y configurar permisos con permisos específicos</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <RolesList
                        roles={roles}
                        selectedRole={selectedRole}
                        onSelectRole={(role) => {
                            setSelectedRole(role);
                            setIsCreating(false);
                        }}
                        onAddRole={handleCreateClick}
                        headerText="Lista de Permisos Disponibles"
                    />
                    <div className="md:col-span-2">
                        {isCreating || selectedRole ? (
                            <RoleForm
                                onCancel={handleCancel}
                                onSubmit={handleSubmitRole}
                                role={selectedRole}
                            />
                        ) : (
                            <RolePlaceHolder
                                icon={UserCog}
                                title="Gestión de Permisos"
                                description="Seleccione un permiso para editar o cree uno nuevo"
                                onAddRole={handleCreateClick}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}