import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalCountry from '@/Pages/CountryManagement/PrincipalCountry';
import { Head } from '@inertiajs/react';

export default function CountryManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Pais"
            backTo="/locationManagement"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Pais" />
            <PrincipalCountry />
        </ModulesLayout>
    );
}
