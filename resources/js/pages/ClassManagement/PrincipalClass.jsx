import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import ContainerShowData from "@/Components/ContainerShowData";
import ClassForm from "@/pages/ClassManagement/ClassForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Curso", key: "nombreCurso" },
    {
        title: "Profesional/docente", key: "profesionales", render: (row) => {
            console.log(row[0].rolDocente.nombre == "Ejecutor");
            const ejecutor = row.filter((profesional) => profesional.rolDocente.nombre == "Ejecutor");
            console.log(ejecutor)
            if (ejecutor.length > 0) {
                return ejecutor[0].nombreCompleto + " (Ejecutor)"
            }
            const mentor = row.filter((profesional) => profesional.rolDocente.nombre == "Mentor");
            if (mentor.length > 0) {
                return mentor[0].nombreCompleto + " (Mentor)"
            }
            const tutor = row.filter((profesional) => profesional.rolDocente.nombre == "Tutor");
            if (tutor.length > 0) {
                return tutor[0].nombreCompleto + " (Tutor)"
            }
        }
    },
    { title: "Aula", key: "aulaNombreCodigo" },
    { title: "Ciudad", key: "nombreCiudad" },
    {
        title: "Rango horario", key: "dias", render: (row) =>
            Array.isArray(row) && row.length > 0 ? (
                row.map((r, idx) => (
                    <ContainerShowData key={idx} text={`${r.nombre} ( ${r.pivot.hora_inicio} - ${r.pivot.hora_fin} )`} bg={"bg-stone-100"} colortext={"text-stone-800"} />
                ))
            ) : (
                <span className="text-gray-400 text-xs italic">Sin prestamos</span>
            ),
    },
];

export default function PrincipalClass() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState(null);

    const api = getApi();

    function handleEdit(row) {
        setSelectedCity(row);
        setShowForm(true);
    }

    async function handleDelete(row) {
        if (!confirm(`¿Estás seguro de eliminar la clase?`)) return;

        try {
            await api.delete(`/Horario/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando clase:", error);
            alert("No se pudo eliminar la clase. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/Horario");
            const transformed = response.data.map(horario => {
                // Log de profesionales (o array vacío si no existe)
                const profesionalesArray = horario?.profesionales ?? [];
                console.log(profesionalesArray);

                // Detectores rápidos
                const hasAula = !!horario?.aula;
                const hasCurso = !!horario?.curso;

                // Desestructuraciones seguras
                const sede = horario?.aula?.sede;
                const ciudad = sede?.ciudad;
                const aula = horario?.aula;

                return {
                    // Si necesitas conservar props originales, déjalo; si no, quítalo:
                    ...horario,

                    // ID del horario
                    id: horario?.idHorario ?? null,

                    // Nombre de la ciudad o fallback
                    nombreCiudad: hasAula
                        ? (ciudad?.nombre ?? "Ciudad desconocida")
                        : "Sin aula",

                    // Nombre del curso o fallback
                    nombreCurso: hasCurso
                        ? (horario.curso?.nombre ?? "Curso sin nombre")
                        : "Curso desconocido",

                    // Código y nombre del aula combinados, o mensajes claros
                    aulaNombreCodigo: hasAula
                        ? (() => {
                            const { codigo, nombre } = aula;
                            if (codigo && nombre) return `(${codigo}) ${nombre}`;
                            if (nombre) return nombre;
                            if (codigo) return `(${codigo})`;
                            return "Aula (datos incompletos)";
                        })()
                        : "Sin aula",

                    // IDs relacionados (null si faltan)
                    idCurso: hasCurso ? (horario.curso.idCurso ?? null) : null,
                    idSede: hasAula ? (sede?.idSede ?? null) : null,
                    idAula: hasAula ? (aula?.idAula ?? null) : null,
                };
            });

            setData(transformed);
        } catch (error) {
            console.error("Error fetching classes:", error);
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
                    title="Gestión Clases"
                    description="Añadir, editar o eliminar clases en las que se imparten cursos"
                    buttonText="Añadir Nueva Clase"
                    verifyPermission={true}
                    module="classes_management"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />
                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                            placeHolderText="Buscando clase"
                        />
                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando clases...
                            </p>
                        ) : (
                            <DataTable
                                columns={columns}
                                permissionsValidate={true}
                                module="classes_management"
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
                        )}
                    </div>
                ) : (
                    <ClassForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedCity(null);
                        }}
                        initialData={selectedCity}
                        onSubmitSuccess={() => fetchData()}
                    />
                )}
            </div>
        </div>
    );
}

