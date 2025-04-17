import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import CourseForm from "@/Pages/CourseManagement/CourseForm";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/Components/Badge";

const columns = [
    { title: "Código", key: "codigoCurso" },
    { title: "Nombre", key: "nombre" },
    { title: "Descripción", key: "descripcion" },
    { title: "Créditos", key: "creditos" },
    { title: "Horas", key: "horas" },
    {
        title: "Programa",
        key: "programas",
        render: (value) => {
            return value.length > 0 ? (
                <>
                    {value.map((programa, idx) => (
                        <Badge label={programa.nombre} />
                    ))}
                </>
            ) : <Badge label="Sin Programa" color="rose" />
        },
    },
    {
        title: "Especialidad", key: "especialidades", render: (value) => {
            return value.length > 0 ? (
                <>
                    {value.map((especialidad, idx) => (
                        <Badge label={especialidad.nombre} />
                    ))}
                </>
            ) : <Badge label="Sin Especialidad" color="pink" />
        },
    },
    {
        title: "Estado",
        key: "estado",
        render: (value) => <StatusBadge status={value} />,
    },
];
const fakeData = [
    {
        id: 1,
        codigoLote: "B001",
        nombre: "Lote Alfa",
        fechaInicio: "2025-04-01",
        fechaFin: "2025-06-30",
        estudiantes: 25,
        cursos: 5,
        programa: "Desarrollo Web",
        estado: "Activo",
    },
    {
        id: 2,
        codigoLote: "B002",
        nombre: "Lote Beta",
        fechaInicio: "2025-05-15",
        fechaFin: "2025-08-15",
        estudiantes: 30,
        cursos: 6,
        programa: "Ciencia de Datos",
        estado: "Próximamente",
    },
    {
        id: 3,
        codigoLote: "B003",
        nombre: "Lote Gamma",
        fechaInicio: "2025-07-01",
        fechaFin: "2025-09-30",
        estudiantes: 20,
        cursos: 4,
        programa: "Inteligencia Artificial",
        estado: "Próximamente",
    },
];


export default function PrincipalCourse() {
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
            const response = await api.get("/curso");
            console.log(response)
            const transformed = (response.data).map((curso) => ({
                ...curso,
                id: curso.idCurso,
                estudiantes: curso.estudiantes || 0,
                cursos: curso.cursos || 0,
                codigoCurso: curso.codigo
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
                    title="Gestión de Cursos"
                    description="Crear, editar y eliminar cursos"
                    buttonText="Añadir Nuevo Curso"
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
                    <CourseForm
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
