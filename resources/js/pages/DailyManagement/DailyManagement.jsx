import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalDaily from '@/pages/DailyManagement/PrincipalDaily';
import { Head } from '@inertiajs/react';

export default function CityManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión diaria"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="DailyManagement" />
            <PrincipalDaily />
        </ModulesLayout>
    );
}
