import ModulesLayout from "@/Layouts/ModulesLayout";
import PrincipalShedule from "@/pages/SheduleManagement/PrincipalShedule";
import { Head } from "@inertiajs/react";
import HeaderSchedule from "@/Components/HeaderSchedule"
import { getApi } from "@/utils/generalFunctions";
import { useState } from "react";


export default function SheduleManagement({ auth }) {
    const api = getApi();

    const [filterFormData, setFilterFormData] = useState({
        ciudad: "", sede: "", entidad: "", idCurso: "", aula: "", profesional: ""
    });

    const exportExcel = async () => {
        try {
            const filterPayload = {};
            if (filterFormData.ciudad) filterPayload.ciudad_id = filterFormData.ciudad;
            if (filterFormData.entidad) filterPayload.entidad_id = filterFormData.entidad;
            if (filterFormData.sede) filterPayload.aula_sede = filterFormData.sede; // Matches fetchData param name
            if (filterFormData.aula) filterPayload.idAula = filterFormData.aula;
            if (filterFormData.idCurso) filterPayload.idCurso = filterFormData.idCurso;
            if (filterFormData.profesional) filterPayload.profesional_codigo = filterFormData.profesional;
            const response = await api.post("/horario/export-xlsx", filterPayload, { // <-- Use POST and send payload
                responseType: 'json' // Expecting JSON response with base64 data
            });
            if (response.data && response.data.base64 && response.data.filename) {
                const link = document.createElement('a');
                link.href = 'data:application/vnd.ms-excel;base64,' + response.data.base64;
                link.download = response.data.filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
            } else {
                console.error("Invalid response structure for export:", response.data);
                alert("Error exporting file: Invalid response from server.");
            }
        } catch (error) {
            console.error("Error exporting schedule:", error);
            alert("Error exporting schedule. Please try again.");
        }
    }

    return (
        <ModulesLayout
            customHeader={
                <HeaderSchedule
                    title="Cronograma de Horarios"
                    backTo="/dashboard"
                    handleExport={exportExcel}
                />
            }
        >
            <Head title="SheduleManagement" />
            <PrincipalSchedule
                formData={filterFormData}
                setFormData={setFilterFormData}
            />
        </ModulesLayout>
    );
}
