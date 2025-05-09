import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import ProfessonalForm from "@/pages/SpacialityAndProfessionals/ProfessonalForm";
import LinkConIcono from "@/Components/LinkConIcono";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Id", key: "codigo" },
    { title: "Profesional", key: "nombreCompleto" },
    { title: "Numero de identificacion", key: "identificacion" },
    { title: "Email", key: "email" },
    { title: "Cualificación", key: "titulo" },
    { title: "Experiencia(Años)", key: "experiencia" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
    {
        title: "Perfil",
        key: "perfil",
        render: (value) =>
            value ? (
                <a
                    href={value}
                    download="perfil.pdf"
                    className="text-blue-500 underline flex items-center gap-1"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Descargar PDF
                    <ExternalLink className="inline w-4 h-4" />
                </a>
            ) : (
                <span className="text-gray-400">Sin PDF</span>
            ),
    },
];

export default function PrincipalProfessonalsManagement() {
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
        if (!confirm(`¿Estás seguro de eliminar el profesional: "${row.nombreCompleto}"?`)) return;

        try {
            await api.delete(`/profesional/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando el profesional:", error);
            alert("No se pudo eliminar el profesional. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/profesional");
            const transformed = response.data.map((profesional) => ({
                ...profesional,
                id: profesional.idProfesional,

            }));
            setData(transformed);
        } catch (error) {
            console.error("Error Obteniendo Profesional:", error);
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
                    title="Gestión profesionales"
                    description="Añadir, editar o eliminar profesionales del sistema"
                    buttonText="Añadir Nuevo Profesional"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                    verifyPermission={true}
                    module="professionals_management"
                />

                {!showForm ? (
                    <div className="space-y-4">

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando Profesionales...
                            </p>
                        ) : (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-gray-200">
                                <div className="relative w-full overflow-auto">
                                    <DataTable
                                        columns={columns}
                                        data={data}
                                        permissionsValidate={true}
                                        module="professionals_management"
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
                    <ProfessonalForm
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
