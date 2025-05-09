import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import EntitieForm from "@/pages/SitesAndEntities/EntitieForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigoEntidad" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    { title: "Contacto", key: "contacto" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];

export default function PrincipalEntitieManagement() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(null);

    const api = getApi();

    function handleEdit(row) {
        setSelectedDay(row);
        setShowForm(true);
    }

    async function handleDelete(row) {
        if (!confirm(`¿Estás seguro de eliminar la entidad: "${row.nombre}"?`)) return;

        try {
            await api.delete(`/entidad/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando entidad:", error);
            alert("No se pudo eliminar la entidad. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/entidad");
            const transformed = response.data.map((entidad) => ({
                ...entidad,
                id: entidad.idEntidad,
                codigoEntidad: entidad.codigo,
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error obteniendo entidades:", error);
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
                    title="Gestión de Entidades"
                    description="Añadir, editar o eliminar entidades asociadas con sedes."
                    buttonText="Añadir Nueva Entidad"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                    verifyPermission={true}
                    module="entities"
                />

                {!showForm ? (
                    <div className="space-y-4">

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando entidad...
                            </p>
                        ) : (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-gray-200">
                                <div className="relative w-full overflow-auto">
                                    <DataTable
                                        columns={columns}
                                        data={data}
                                        permissionsValidate={true}
                                        module="entities"
                                        rowActions={(row) => [
                                            {
                                                icon: Pencil,
                                                label: "Editar",
                                                onClick: () => handleEdit(row),
                                            },
                                            {
                                                icon: Trash2,
                                                label: "Eliminar",
                                                onClick: () => handleDelete(row),
                                                danger: true,
                                            },
                                        ]}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <EntitieForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedDay(null);
                        }}
                        initialData={selectedDay}
                        onSubmitSuccess={() => fetchData()}
                    />
                )}
            </div>
        </div>
    );
}
