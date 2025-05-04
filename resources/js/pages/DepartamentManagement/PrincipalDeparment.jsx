import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import DeparmentForm from "@/pages/DepartamentManagement/DeparmentForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Nombre", key: "nombre" },
    { title: "Descripcion", key: "descripcion" },
    { title: "Region", key: "nombreRegion" },
];

export default function PrincipalDeparment() {
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
        console.log(row);
        if (!confirm(`¿Estás seguro de eliminar la siguiente departamento: "${row.nombre}"?`)) return;

        try {
            await api.delete(`/estado/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando la region:", error);
            alert("No se pudo eliminar la region. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/estado");
            const transformed = response.data.map((departamento) => ({
                ...departamento,
                id: departamento.idEstado,
                nombreRegion: departamento.region?.nombre || "Sin Region",
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error fetching departamentos:", error);
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
                    title="Gestión de Departamentos"
                    description="Añadir, editar o eliminar regiones en las que se imparten cursos"
                    buttonText="Añadir Nueva Region"
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
                                Cargando Regiones...
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
                    <DeparmentForm
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
