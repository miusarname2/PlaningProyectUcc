import { useState, useEffect } from "react";
import TextInput from "@/Components/TextInput";
import InputLabel from "@/Components/InputLabel";
import SelectInput from "@/Components/SelectInput";
import ButtonGradient from "@/Components/ButtonGradient";
import CancelButton from "@/Components/CancelButton";
import { Save } from "lucide-react";
import { getApi } from "@/utils/generalFunctions";

export default function BatchForm({ onCancel, initialData = null, onSubmitSuccess }) {
    const defaultProgramOption = { value: "", label: "Seleccione programa", disabled: true };
    const defaultEstadoOption = { value: "", label: "Seleccione estado", disabled: true };
    const api = getApi();
    const isEditMode = Boolean(initialData);

    const generateCodigo = async () => {
        try {
            const resp = await api.get("/lote");
            const next = resp.data.length + 1;
            return `LO${String(next).padStart(3, "0")}`;
        } catch (e) {
            console.error("Error generating code:", e);
            return "";
        }
    };

    const [programOptions, setProgramOptions] = useState([defaultProgramOption]);

    const [formData, setFormData] = useState({
        idLote: initialData?.id || "",
        codigo: initialData?.codigo || "",
        nombre: initialData?.nombre || "",
        idPrograma: initialData?.idPrograma,
        estado: initialData?.estado || "Activo",
        fechaInicio: initialData?.rangoFechas?.inicio || initialData?.rangoFechas?.inicio || "",
        FechaFin: initialData?.rangoFechas?.fin || initialData?.rangoFechas?.fin || "",
        numEstudiantes: initialData?.estudiantes || 0
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Traer programas disponibles desde API
        const fetchPrograms = async () => {
            try {
                const response = await api.get("/programa"); // Ajusta si tu endpoint es diferente
                const options = response.data.map((program) => ({
                    value: program.idPrograma,
                    label: program.nombre,
                }));
                setProgramOptions([defaultProgramOption, ...options]);
            } catch (error) {
                console.error("Error fetching programs:", error);
            }
        };

        fetchPrograms();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si el campo es fecha y el usuario escribe en formato DD/MM/YYYY, conviértelo
        if ((name === "fechaInicio" || name === "fechaFin") && value.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            const [day, month, year] = value.split("/");
            const formatted = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
            setFormData((prev) => ({ ...prev, [name]: formatted }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            console.log(payload);

            if (isEditMode) {
                await api.put(`/lote/${formData.idLote}`, payload);
            } else {
                payload.codigo = await generateCodigo();
                await api.post("/lote", payload);
            }

            setErrors({});
            onSubmitSuccess?.();
            onCancel();
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
                console.error("Validation errors:", error.response.data.errors);
            } else {
                console.error("Error saving batch:", error);
            }
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Añadir nuevo lote</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <InputLabel htmlFor="name" value="Nombre del lote" />
                            <TextInput
                                id="name"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Introduzca el nombre del lote"
                                required
                                error={errors.nombre}
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="programId" value="Programa" />
                            <SelectInput
                                id="programId"
                                name="idPrograma"
                                value={formData.idPrograma}
                                onChange={(e) => {
                                    handleChange({ target: { name: 'idPrograma', value: e.target.value } });
                                }}
                                options={programOptions}
                                required
                                error={errors.idPrograma}
                                placeholder="Seleccionar programa"
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="status" value="Estado" />
                            <SelectInput
                                id="status"
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                options={[defaultEstadoOption,{ value: "Activo", label: "Activo" }, { value: "Inactivo", label: "Inactivo" }]}
                                error={errors.estado}
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="startDate" value="Fecha de inicio" />
                            <TextInput
                                id="startDate"
                                name="fechaInicio"
                                type="date"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                required
                                error={errors.fechaInicio}
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel htmlFor="endDate" value="Fecha final" />
                            <TextInput
                                id="endDate"
                                name="FechaFin"
                                type="date"
                                value={formData.FechaFin}
                                onChange={handleChange}
                                required
                                error={errors.FechaFin}
                            // placeholder="dd/mm/aaaa"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {isEditMode ? "Guardar Cambios" : "Crear Lote"}
                        </ButtonGradient>
                    </div>
                </div>
            </form>
        </div>
    );
}
