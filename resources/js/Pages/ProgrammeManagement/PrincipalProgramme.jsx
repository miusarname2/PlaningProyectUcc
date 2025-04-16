import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import ProgrammeForm from "@/Pages/ProgrammeManagement/ProgrammeForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigo" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    {
        title: "Duración",
        key: "duracion",
        render: (value, row) => `${value} MInutos`,
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
        if (!confirm(`¿Estás seguro de eliminar el programa "${row.nombre}"?`))
            return;

        try {
            await api.delete(`/programa/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando programa:", error);
            alert("No se pudo eliminar el programa. Intenta más tarde.");
        }
    }
    console.log(data);

    async function fetchData(query) {
        setLoading(true);
    
        try {
            let programas = [];
    
            if (!query || query.trim() === "") {
                const response = await api.get("/programa");
                programas = response.data; // <-- Aquí asumo que en esta ruta no es paginada
            } else {
                // Si el query contiene solo números => se asume que busca por código
                const trimmed = query.trim();
                const isCodigo = /^PRG\d+$/i.test(trimmed);
                const isEstado = /^(Activo|Inactivo)$/i.test(trimmed);
                const params = isCodigo
                    ? { codigo: trimmed }
                    : isEstado
                        ? { estado: trimmed }
                        : { nombre: trimmed };
    
                const response = await api.get("/programa/search", { params });
    
                console.log("Respuesta del backend:", response.data);
                programas = response.data?.data?.data || []; // paginado
            }
    
            const transformed = programas.map((program) => ({
                ...program,
                id: program.idPrograma ?? 0,
                nombre: program.nombre ?? "",
                descripcion: program.descripcion ?? "",
                cantidadLotes: program.lotes?.length ?? 0,
                cantidadCursos: program.cursos?.length ?? 0,
                especialidad: program.especialidad?.nombre ?? "N/A",
                idEspecialidad: program.idEspecialidad ?? "N/A",
                duracion: program.duracion ?? 0,
                codigo: program.codigo ?? "",
            }));
    
            setData(transformed);
        } catch (error) {
            console.error("Error buscando programas:", error);
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
                            onSearchChange={(val) => fetchData(val)}
                            placeHolderText="Buscar por nombre o código"
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
                                                onClick: () =>
                                                    handleDelete(row),
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
