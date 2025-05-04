import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi, formatFechaLocal } from "@/utils/generalFunctions";
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
            const inicio = formatFechaLocal(row.rangoFechas?.inicio);
            const fin = formatFechaLocal(row.rangoFechas?.fin);
            return `${inicio} - ${fin}`;
        },
    },
    { title: "Estudiantes", key: "estudiantes" },
    {
        title: "Cursos",
        key: "cursos",
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
        if (!confirm(`¿Estás seguro de eliminar el lote "${row.nombre}"?`))
            return;

        try {
            await api.delete(`/lote/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando lote:", error);
            alert("No se pudo eliminar el lote. Intenta más tarde.");
        }
    }

    async function fetchData(query) {
        setLoading(true);

        try {
            let lotes = [];

            if (!query || query.trim() === "") {
                const response = await api.get("/lote");
                lotes = response.data;
                console.log(response.data);

            } else {
                const trimmed = query.trim();
                const isCodigo = /^[A-Za-z]{2,}\d+$/.test(trimmed);
                const isEstado = /^(Activo|Inactivo)$/i.test(trimmed);

                const params = isCodigo
                    ? { codigo: trimmed }
                    : isEstado
                        ? { estado: trimmed }
                        : { nombre: trimmed };

                const response = await api.get("/lote/search", { params });
                console.log("Respuesta del backend:", response.data);
                lotes = response.data?.data?.data || [];
            }

            const transformed = lotes.map((lote) => ({
                id: lote.idLote,
                codigo: lote.codigo,
                nombre: lote.nombre,
                programa: lote.programa?.nombre || "Sin programa",
                rangoFechas: {
                    inicio: lote.fechaInicio,
                    fin: lote.fechaFin,
                },
                estudiantes: lote.numEstudiantes || 0,
                cursos: lote.programa?.cursos?.length || 0,
                estado: lote.estado,
                idPrograma: lote.idPrograma || 0,
            }));

            setData(transformed);
        } catch (error) {
            console.error("Error buscando lotes:", error);
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
                            onSearchChange={(val) => fetchData(val)}
                            placeHolderText="Buscar por código o nombre"
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
