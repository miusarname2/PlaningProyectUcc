import HeaderModule from "@/Components/HeaderModule";
import InputSearch from "@/Components/InputSearch";
import DataTable from "@/Components/DataTable";
import { getApi } from "@/utils/generalFunctions";
import { useState, useEffect } from "react";
import StatusBadge from "@/Components/StatusBadge";
import CityForm from "@/Pages/CityManagement/CityForm";
import { Pencil, Trash2 } from "lucide-react";

const columns = [
    { title: "ID", key: "codigoCiudad" },
    { title: "Nombre de la ciudad", key: "nombre" },
    { title: "País", key: "pais" },
    { title: "Región", key: "region" },
    { title: "Código postal", key: "codigoPostal" },
    { title: "Sedes", key: "sedes" },
   
];


export default function PrincipalCity() {
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
        if (!confirm(`¿Estás seguro de eliminar la ciudad "${row.nombre}"?`)) return;

        try {
            await api.delete(`/ciudad/${row.id}`);
            fetchData();
        } catch (error) {
            console.error("Error eliminando ciudad:", error);
            alert("No se pudo eliminar la ciudad. Intenta más tarde.");
        }
    }

    async function fetchData() {
        try {
            const response = await api.get("/ciudad");
    console.log(response.data);
            const transformed = response.data.map((city) => ({
                ...city,
                id: city.idCiudad,
                codigoCiudad: `C${String(city.idCiudad).padStart(3, '0')}`,
                pais: city.region?.pais?.nombre || "Sin país",
                idPais: city.region?.pais?.idPais || "Sin id pais",
                region: city.region?.nombre || "Sin región",
                idRegion: city.region?.idRegion || "Sin id region",
                sedes: city.sedes?.length || 0,
            }));
    
            setData(transformed);
        } catch (error) {
            console.error("Error fetching cities:", error);
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
                    title="Gestión municipal"
                    description="Añadir, editar o eliminar ciudades en las que se imparten cursos"
                    buttonText="Añadir Nueva Ciudad"
                    onClick={() => setShowForm(true)}
                    showButton={!showForm}
                />
                {!showForm ? (
                    <div className="space-y-4">
                        <InputSearch
                            onSearchChange={(val) =>
                                console.log("Filtro buscador:", val)
                            }
                            placeHolderText="Buscando Ciudades"
                        />
                        {loading ? (
                            <p className="text-center text-gray-500">
                                Cargando ciudades...
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
                    <CityForm
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
