import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import BatchForm from "@/Pages/BatchManagement/BatchForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Código", key: "codigo" },
    { title: "Nombre del lote", key: "nombre" },
    { title: "Programa", key: "programa" },
    {
        title: "Intervalo de fechas",
        key: "rangoFechas",
        render: (val, row) => {
            const inicio = row.rangoFechas?.inicio ? new Date(row.rangoFechas.inicio).toLocaleDateString() : "-";
            const fin = row.rangoFechas?.fin ? new Date(row.rangoFechas.fin).toLocaleDateString() : "-";
            return `${inicio} - ${fin}`;
        },
    },
    { title: "Estudiantes", key: "estudiantes" },
    {
        title: "Cursos",
        key: "cursos"
    },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];



export default function PrincipalBatch() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const api = getApi();

    function handleEdit(row) {
        setSelectedBatch(row);
        setShowForm(true);
    }

    async function handleDelete(row) {
        if (!confirm(`¿Estás seguro de eliminar el lote "${row.nombre}"?`)) return;

        try {
            await api.delete(`/lote/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando lote:", error);
            alert("No se pudo eliminar el lote. Intenta más tarde.");
        }
    }

    // async function fetchData() {
    //     try {
    //         const response = await api.get("/lote");
    //         const transformed = response.data.map((lote) => ({
    //             ...lote,
    //             id: lote.id,
    //             codigoLote: lote.codigoLote || `B${String(lote.id).padStart(3, "0")}`,
    //             estudiantes: lote.estudiantes?.length || 0,
    //             cursos: lote.cursos?.length || 0,
    //             programa: lote.programa?.nombre || "Sin asignar",
    //         }));
    //         setData(transformed);
    //     } catch (error) {
    //         console.error("Error obteniendo lotes:", error);
    //     } finally {
    //         setLoading(false);
    //     }
    // }
    async function fetchData() {
        try {
            const response = await api.get("/lote");
            console.log(response.data[0].programa);
            
            const transformed = response.data.map((lote) => ({
                id: lote.idLote,
                codigo: lote.codigo,
                nombre: lote.nombre,
                programa: lote.programa?.nombre || "Sin programa",
                rangoFechas: {
                    inicio: lote.fechaInicio,
                    fin: lote.fechaFin,
                },
                estudiantes: lote.numEstudiantes || 0,
                cursos: lote.programa?.cursos.length || 0,
                estado: lote.estado,
                idPrograma: lote.programa?.idPrograma,
            }));

            setData(transformed);
            console.log(data);
            
        } catch (error) {
            console.error("Error cargando datos de lotes:", error);
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
                    title="Gestión de lotes"
                    description="Configurar los lotes académicos para los programas"
                    buttonText="Añadir Nuevo Lote"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                            placeHolderText="Buscando ofertas"
                        />

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando lotes...
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
                    <BatchForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedBatch(null);
                        }}
                        initialData={selectedBatch}
                        onSubmitSuccess={() => fetchData()}
                    />
                )}
            </div>
        </div>
    );
}
