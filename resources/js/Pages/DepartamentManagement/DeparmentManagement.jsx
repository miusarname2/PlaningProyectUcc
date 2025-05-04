import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalDeparment from '@/Pages/DepartamentManagement/PrincipalDeparment';
import { Head } from '@inertiajs/react';

export default function CityManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Departamentos"
            backTo="/locationManagement"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Departamentos" />
            <PrincipalDeparment />
        </ModulesLayout>
    );
}
