import ModulesLayout from "@/Layouts/ModulesLayout";
import PrincipalShedule from "@/Pages/SheduleManagement/PrincipalShedule";
import { Head } from "@inertiajs/react";
import  HeaderSchedule  from "@/Components/HeaderSchedule"


export default function SheduleManagement({ auth }) {
    return (
        <ModulesLayout
            customHeader={
                <HeaderSchedule
                    title="Cronograma de Horarios"
                    backTo="/dashboard"
                />
            }
        >
            <Head title="SheduleManagement" />
            <PrincipalShedule />
        </ModulesLayout>
    );
}
