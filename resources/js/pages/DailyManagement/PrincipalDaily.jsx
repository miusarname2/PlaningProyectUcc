import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import DailyForm from "@/pages/DailyManagement/DailyForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigoDia" },
    { title: "Nombre del día", key: "nombre" },
    { title: "Nombre corto", key: "nombreCorto" },
    {
        title: "Fin de semana",
        key: "finDeSemana",
        render: (value) => (
            <ContainerShowData
                text={value ? "Sí" : "No"}
                bg={value ? "bg-green-50" : "bg-red-50"}
                colortext={value ? "text-green-700" : "text-red-700"}
            />
        ),
    },
    { title: "Cursos", key: "cursos" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];
const fakeDaysData = [
    {
        id: 1,
        codigoDia: "D001",
        nombre: "Lunes",
        nombreCorto: "Lun",
        finDeSemana: false,
        cursos: 5,
        estado: "Activo",
    },
    {
        id: 2,
        codigoDia: "D002",
        nombre: "Martes",
        nombreCorto: "Mar",
        finDeSemana: false,
        cursos: 3,
        estado: "Activo",
    },
    {
        id: 3,
        codigoDia: "D003",
        nombre: "Sábado",
        nombreCorto: "Sáb",
        finDeSemana: true,
        cursos: 0,
        estado: "inactivo",
    },
    {
        id: 4,
        codigoDia: "D004",
        nombre: "Domingo",
        nombreCorto: "Dom",
        finDeSemana: true,
        cursos: 2,
        estado: "activo",
    },
];

export default function PrincipalDaily() {
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
            await api.delete(`/dia/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando día:", error);
            alert("No se pudo eliminar el día. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            // const response = await api.get("/daily");
            const response = { data: fakeDaysData }; 
            const transformed = response.data.map((day) => ({
                ...day,
                id: day.id,
                codigoDia: day.codigoDia || `D${String(day.id).padStart(3, "0")}`,
                cursos: day.cursos?.length || 0,
                finDeSemana: !!day.finDeSemana,
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
                    title="Gestión de días"
                    description="
                    Configurar los días en que se imparten las clases"
                    buttonText="Añadir Nuevo Día"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                            placeHolderText="Buscando fechas"
                        />

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando días...
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
                    <DailyForm
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
