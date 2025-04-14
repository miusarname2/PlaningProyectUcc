import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import SitiesForm from "@/Pages/SitesAndEntities/SitiesForm";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import LinkConIcono from "@/Components/LinkConIcono";

function verifyUrl(text) {
    try {
        if (text.startsWith("www")) {
            text = "http://" + text;
        }
        new URL(text);
        return true;
    } catch (err) {
        return false;
    }
}


const columns = [
    { title: "ID", key: "codigoSede" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    {
        title: "Tipo",
        key: "tipo",
        render: (value) => (
            <ContainerShowData
                text={value == 'Virtual' ? "Virtual" : "Fisica"}
                bg={value == 'Virtual' ? "bg-purple-100" : "bg-blue-100"}
                colortext={value == 'Virtual' ? "text-purple-800" : "text-blue-800"}
            />
        ),
    },
    {
        title: "Acceso",
        key: "acceso",
        render: (value) => (verifyUrl(value) ? <LinkConIcono url={value.startsWith('http') || value.startsWith('https') ? value : `http://${value}`} icon={ExternalLink}>Entrar al Sitio</LinkConIcono> : <StatusBadge status={value} />),
    }
];

export default function PrincipalSitiesManagement() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSitie, setSelectedSitie] = useState(null);

    const api = getApi();

    function handleEdit(row) {
        setSelectedSitie(row);
        setShowForm(true);
    }

    async function handleDelete(row) {
        if (!confirm(`¿Estás seguro de eliminar la sede: "${row.nombre}"?`)) return;

        try {
            await api.delete(`/sede/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando la sede:", error);
            alert("No se pudo eliminar la sede. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/sede");
            console.log(response);
            const transformed = response.data.map((sitie) => ({
                ...sitie,
                id: sitie.idSede,
                codigoSede: sitie.codigo,
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error obteniendo la sede:", error);
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
                    title="Gestión de Sedes"
                    description="Añadir, editar o eliminar sedes del sistema"
                    buttonText="Añadir Nueva Sede"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                        />

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando Sedes...
                            </p>
                        ) : (
                            <div className="rounded-lg border bg-card text-card-foreground shadow-sm border-gray-200">
                                <div className="relative w-full overflow-auto">
                                    <DataTable
                                        columns={columns}
                                        data={data}
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
                    <SitiesForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedSitie(null);
                        }}
                        initialData={selectedSitie}
                        onSubmitSuccess={() => fetchData()}
                    />
                )}
            </div>
        </div>
    );
}
