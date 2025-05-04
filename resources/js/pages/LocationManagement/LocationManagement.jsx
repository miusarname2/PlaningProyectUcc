import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalLocation from '@/pages/LocationManagement/PrincipalLocation';
import { Head } from '@inertiajs/react';

export default function LocationManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Ubicacion"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Ubicacion" />
            <PrincipalLocation />
        </ModulesLayout>
    );
}
