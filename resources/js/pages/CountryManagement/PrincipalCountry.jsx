import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import CountryForm from "@/pages/CountryManagement/CountryForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "Nombre", key: "nombre" },
    { title: "Descripcion", key: "descripcion" },
];

export default function PrincipalCountry() {
    const [showForm, setShowForm] = useState(false);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState(null);

    const api = getApi();

    function handleEdit(row) {
        setSelectedCountry(row);
        setShowForm(true);
    }

    async function handleDelete(row) {
        if (!confirm(`¿Estás seguro de eliminar: "${row.nombre}"?`)) return;

        try {
            await api.delete(`/pais/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando el pais:", error);
            alert("No se pudo eliminar el pais. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/pais");
            console.log(response.data);
            const transformed = response.data.map((pais) => ({
                ...pais,
                id: pais.idPais,
            }));
            setData(transformed);
        } catch (error) {
            console.error("Error fetching countries:", error);
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
                    title="Gestión de Pais"
                    description="Añadir, editar o eliminar Paises en las que se imparten cursos"
                    buttonText="Añadir Nuevo Pais"
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
                                Cargando paises...
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
                    <CountryForm
                        onCancel={() => {
                            setShowForm(false);
                            setSelectedCountry(null);
                        }}
                        initialData={selectedCountry}
                        onSubmitSuccess={() => fetchData()}
                    />
                )}
            </div>
        </div>
    );
}
