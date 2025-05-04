import ModulesLayout from "@/Layouts/ModulesLayout";
import PrincipalShedule from "@/pages/SheduleManagement/PrincipalShedule";
import { Head } from "@inertiajs/react";
import HeaderSchedule from "@/Components/HeaderSchedule"
import { getApi } from "@/utils/generalFunctions";


export default function SheduleManagement({ auth }) {
    const api = getApi();

    const exportExcel = async () => {
        const response = await api.get("/horario/export-xlsx");
        const link = document.createElement('a');
        link.href = 'data:application/vnd.ms-excel;base64,' + response.data.base64;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
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
            <PrincipalShedule />
        </ModulesLayout>
    );
}
