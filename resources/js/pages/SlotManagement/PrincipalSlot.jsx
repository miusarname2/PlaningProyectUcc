import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi, formatFechaLocal } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ContainerShowData from "@/Components/ContainerShowData";
import SlotForm from "@/pages/SlotManagement/SlotForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Código", key: "codigo" },
    { title: "Nombre", key: "nombre" },
    {
        title: "Intervalo de fechas",
        key: "rangoFechas",
        render: (val, row) => {
            console.log(row);
            const inicio = row.rangoFechas?.inicio;
            const fin = row.rangoFechas?.fin;
            return `${inicio} - ${fin}`;
        },
    },
    { title: "Duración", key: "duracionMinutos" },
    { title: "Tipo", key: "tipo" },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];

export default function PrincipalRol() {
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
        if (!confirm(`¿Estás seguro de eliminar la franja Horaria: "${row.nombre}"?`))
            return;

        try {
            await api.delete(`/franjaHoraria/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando franja Horaria:", error);
            alert("No se pudo eliminar el franja Horaria. Intenta más tarde.");
        }
    }

    async function fetchData(query) {
        setLoading(true);

        try {
            let franjasHorarias = [];

            if (!query || query.trim() === "") {
                const response = await api.get("/franjaHoraria");
                franjasHorarias = response.data; // Asumo que no viene paginada
            } else {
                const trimmed = query.trim();
            const isCodigo = /^\d+$/.test(trimmed);
            const isEstado = /^(activo|inactivo)$/i.test(trimmed);
            
            const params = isCodigo
                ? { codigo: trimmed }
                : isEstado
                ? { estado: trimmed }
                : { nombre: trimmed };

            const response = await api.get("/lote/search", { params });
            console.log("Respuesta del backend:", response.data);
            franjasHorarias = response.data?.data?.data || []; // <-- Acceso a datos paginados
            }

            const transformed = franjasHorarias.map((franjaHoraria) => {
                console.log(franjaHoraria);
                return ({
                    ...franjaHoraria,
                    id: franjaHoraria.idFranjaHoraria,
                    codigo: franjaHoraria.codigo,
                    nombre: franjaHoraria.nombre,
                    rangoFechas: {
                        inicio: franjaHoraria.horaInicio,
                        fin: franjaHoraria.horaFin,
                    },
                    estado: franjaHoraria.estado,
                })
            });

            setData(transformed);
        } catch (error) {
            console.error("Error buscando franjas Horarias:", error);
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
                    title="Gestión de Franjas Horarias"
                    description="Definir y gestionar las franjas horarias de los cursos"
                    buttonText="Añadir Nueva Franja"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />

                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) => fetchData(val)}
                            placeHolderText="Buscar por código, nombre o programa"
                        />

                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando Franjas Horarias...
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
                    <SlotForm
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
