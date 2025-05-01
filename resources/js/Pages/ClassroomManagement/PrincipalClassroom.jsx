import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import { Badge } from "@/Components/Badge";
import ContainerShowData from "@/Components/ContainerShowData";
import ClassroomForm from "@/Pages/ClassroomManagement/ClassroomForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigoAula" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripcion", key: "descripcion" },
    { title: "Entidad", key: "sede", render: (value) => value ? value?.propietario?.nombre : 'Sin Propietario' },
    { title: "Sede", key: "sede", render: (val) => val ? `${val?.nombre}, ${val?.acceso}` : 'Sin Sede' },
    { title: "Ciudad", key: "sede", render: (value) => value ? value?.ciudad?.nombre : 'Sin Ciudad' },
    { title: "capacidad", key: "capacidad" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <Badge label={value} color={value == "Disponible" ? 'green' : 'red'} />,
    },
];

export default function PrincipalClassroom() {
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
        if (!confirm(`¿Estás seguro de eliminar el día "${row.nombre}"?`)) return;

        try {
            await api.delete(`/aula/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando día:", error);
            alert("No se pudo eliminar el día. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/aula");
            console.log(response);
            const transformed = response.data.map((aula) => ({
                ...aula,
                id: aula.idAula,
                codigoAula: aula.codigo
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error obteniendo días:", error);
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
                    title="Gestión de Aula"
                    description="Gestionar las aulas disponibles en cada sede"
                    buttonText="Añadir Nueva Aula"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                            placeHolderText="Buscando Aulas"
                        />

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando Aulas...
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
                    <ClassroomForm
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
