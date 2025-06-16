import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import ProfessonalForm from "@/pages/SpacialityAndProfessionals/ProfessonalForm";
import LinkConIcono from "@/Components/LinkConIcono";
import { Button } from "@/Components/Button";
import { Download, ExternalLink, Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Id", key: "codigo" },
    { title: "Profesional", key: "nombreCompleto" },
    { title: "Numero de Identificacion", key: "identificacion" },
    { title: "Email", key: "email" },
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

    const exportExcel = async () => {
        const response = await api.get("/profesional/export-xlsx");
        const link = document.createElement('a');
        link.href = 'data:application/vnd.ms-excel;base64,' + response.data.base64;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    }

    useEffect(() => {
        fetchData();
    }, []);

    function getSearchType(value) {
        const trimmed = value.trim();
        if (/^\d+$/.test(trimmed)) return "identificacion";
        if (/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(trimmed)) return "nombreCompleto";
    }

    async function handleSearch(value) {
        if (!value) {
            fetchData();
            return;
        }

        try {
            const type = getSearchType(value);
            const response = await api.get(`/profesional/search?${type}=${encodeURIComponent(value)}`);

            const transformed = response.data.data.data.map((profesional) => ({
                 ...profesional,
                id: profesional.idProfesional,
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error buscando profesionales:", error);
        }
    }

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
                    exportExcel={true}
                    handleExport={exportExcel}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) => handleSearch(val)}
                            placeHolderText="Buscando profesionales"
                        />
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
