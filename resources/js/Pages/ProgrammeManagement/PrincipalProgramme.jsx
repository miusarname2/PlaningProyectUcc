import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import ProgrammeForm from "@/Pages/ProgrammeManagement/ProgrammeForm"; // Asegúrate de tenerlo creado
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigoPrograma" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    {
        title: "Duración",
        key: "duracion",
        render: (value, row) => `${value} ${row.unidadDuracion}`,
    },
    { title: "Especialidad", key: "especialidad" },
    { title: "Lotes", key: "cantidadLotes" },
    { title: "Cursos", key: "cantidadCursos" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];

const fakeProgrammesData = [
    {
        id: 1,
        codigoPrograma: "P001",
        nombre: "Web Development",
        descripcion: "Full-stack web development programme",
        duracion: 6,
        unidadDuracion: "meses",
        especialidad: "Ingeniería de Software",
        cantidadLotes: 3,
        cantidadCursos: 12,
        estado: "Activo",
    },
    {
        id: 2,
        codigoPrograma: "P002",
        nombre: "Data Science",
        descripcion: "Data analysis and machine learning programme",
        duracion: 8,
        unidadDuracion: "meses",
        especialidad: "Ciencia de Datos",
        cantidadLotes: 2,
        cantidadCursos: 15,
        estado: "Inactivo",
    },
];

export default function PrincipalProgramme() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProgramme, setSelectedProgramme] = useState(null);

    const api = getApi();

    function handleEdit(row) {
        setSelectedProgramme(row);
        setShowForm(true);
    }

    async function handleDelete(row) {
        if (!confirm(`¿Estás seguro de eliminar el programa "${row.nombre}"?`)) return;

        try {
            await api.delete(`/programa/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando programa:", error);
            alert("No se pudo eliminar el programa. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            // const response = await api.get("/programa");
            const response = { data: fakeProgrammesData };

            const transformed = response.data.map((program) => ({
                ...program,
                cantidadLotes: program.cantidadLotes ?? 0,
                cantidadCursos: program.cantidadCursos ?? 0,
            }));

            setData(transformed);
        } catch (error) {
            console.error("Error obteniendo programas:", error);
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
                    title="Gestión de programas"
                    description="Organizar y gestionar diferentes programas educativos"
                    buttonText="Añadir Nuevo Programa"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                            placeHolderText="Buscando programas"
                        />

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando programas...
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
                    <ProgrammeForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedProgramme(null);
                        }}
                        initialData={selectedProgramme}
                        onSubmitSuccess={() => fetchData()}
                    />
                )}
            </div>
        </div>
    );
}
