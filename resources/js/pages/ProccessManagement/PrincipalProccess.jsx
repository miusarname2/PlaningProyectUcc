import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import ProccessForm from "@/pages/ProccessManagement/ProccessForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigoProceso" },
    { title: "Nombre del proceso", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    { title: "Pasos", key: "cantidadPasos" },
    { title: "Departamento", key: "departamento",render:(value)=>value.nombre },
    { title: "Última actualización", key: "updated_at" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];


export default function PrincipalProccess() {
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
        if (!confirm(`¿Estás seguro de eliminar el proceso: "${row.nombre}"?`)) return;

        try {
            await api.delete(`/proceso/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando proceso:", error);
            alert("No se pudo eliminar el proceso. Intenta más tarde.");
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
            // Simulando transformación como si vinieran de la API
            const response = await api.get("/proceso");
            console.log(response.data);
            const transformed = (response.data).map((proceso) => ({
                ...proceso,
                codigoProceso:proceso.codigo            
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error simulando datos de lotes:", error);
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
                    title="Gestión de procesos"
                    description="Definir y gestionar los procesos educativos y administrativos"
                    buttonText="Añadir Nuevo Proceso"
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
                    <ProccessForm
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
