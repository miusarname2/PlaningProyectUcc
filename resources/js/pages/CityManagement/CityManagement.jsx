import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalCity from '@/pages/CityManagement/PrincipalCity';
import { Head } from '@inertiajs/react';

export default function CityManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión municipal"
            backTo="/locationManagement"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="CityManagement" />
            <PrincipalCity />
        </ModulesLayout>
    );
}
