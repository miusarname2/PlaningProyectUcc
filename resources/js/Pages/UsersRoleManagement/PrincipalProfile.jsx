import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import ContainerShowData from "@/Components/ContainerShowData";
import ProfileForm from "@/Pages/UsersRoleManagement/ProfileForm";
import { Pencil } from "lucide-react";
const columns = [
    { title: "Nombre del Perfil", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    {
        title: "Permisos Asignados",
        key: "roles",
        render: (roles) =>
            Array.isArray(roles) && roles.length > 0 ? (
                roles.map((r, idx) => (
                    <ContainerShowData key={idx} text={r.nombre} />
                ))
            ) : (
                <span className="text-gray-400 text-xs italic">Sin Permisos</span>
            ),
    },
    {
        title: "Usuarios",
        key: "countUsers",
    },
];


export default function PrincipalProfile() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);

    function handleEdit(row) {
        setSelectedUser(row);
        setShowForm(true);
    }

    const api = getApi();

    async function fetchData(query) {
        setLoading(true);
        try {
            let perfiles = [];

            if (!query || query.trim() === "") {
                const response = await api.get("/perfil");
                perfiles = response.data;
            } else {
                const trimmed = query.trim();
                const params = { nombreDescripcion: trimmed };
                const response = await api.get("/perfil/search", { params });
                perfiles = response.data?.data?.data || [];
            }

            const transformed = perfiles.map((profile) => ({
                ...profile,
                id: profile.idPerfil,
                nombre:profile.nombre || "Sin Nombre",
                descripcion:profile.descripcion || "Sin Descripción",
                countUsers: profile.usuarios_count ?? 0
            }));

            setData(transformed);
        } catch (error) {
            console.error("Error fetching profiles:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <HeaderModule
                    title="Gestión de Perfiles"
                    description="Gestionar los perfiles de usuario y asignar las funciones adecuadas"
                    buttonText="Crear Perfil"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />
                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) => fetchData(val)}
                            placeHolderText="Buscando Perfiles"
                        />
                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando Perfiles...
                            </p>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={data}
                                rowActions={(row) => {
                                    const actions = [
                                        {
                                            icon: Pencil,
                                            label: "Editar",
                                            onClick: () => handleEdit(row),
                                        },
                                    ];

                                    // actions.push({
                                    //     icon: row.estado === "Activo" ? UserX : UserCheck,
                                    //     label: row.estado === "Activo" ? "Desactivar" : "Activar",
                                    //     onClick: () => toggleUserState(row),
                                    // });

                                    // actions.push({
                                    //     icon: Trash2,
                                    //     label: "Eliminar",
                                    //     onClick: () => handleDelete(row),
                                    //     danger: true,
                                    // });

                                    return actions;
                                }}
                            />
                        )}
                    </div>
                ) : (
                    <ProfileForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedUser(null);
                        }}
                        initialData={selectedUser}
                        onSubmitSuccess={() => {
                            fetchData();
                        }}
                    />
                )}
            </div>
        </div>
    );
}