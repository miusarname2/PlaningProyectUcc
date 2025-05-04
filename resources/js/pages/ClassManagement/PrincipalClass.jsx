import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import ClassForm from "@/pages/ClassManagement/ClassForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Curso", key: "nombreCurso" },
    { title: "Profesional/docente", key: "nombreProfesional" },
    { title: "Aula", key: "aulaNombreCodigo"},
    { title: "Ciudad", key: "nombreCiudad" },
    { title: "Rango horario", key: "RangoHorario" },
    { title: "dia", key: "dia" },
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
            console.log(response);
            const transformed = response.data.map((horario) => {
                console.log(horario);
                return {
                    ...horario,
                    id: horario.idHorario,
                    nombreCiudad:horario?.aula?.sede?.ciudad?.nombre,
                    nombreCurso:horario.curso.nombre,
                    nombreProfesional:horario.profesional.nombreCompleto,
                    aulaNombreCodigo:`(${horario.aula.codigo}) ${horario.aula.nombre}`,
                    RangoHorario: `${horario.hora_inicio} - ${horario.hora_fin}`,
                    idCurso: horario.curso.idCurso,
                    idProfesional: horario.profesional.idProfesional,
                    idSede: horario?.aula?.sede?.idSede,
                    idAula: horario.aula.idAula,
                };
            });

            setData(transformed);
        } catch (error) {
            console.error("Error fetching classses:", error);
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

