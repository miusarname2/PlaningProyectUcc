import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalEntitieManagement from '@/Pages/SitesAndEntities/PrincipalEntitieManagement';
import { Head } from '@inertiajs/react';

export default function PrincipalEntitie({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Entidades"
            backTo="/sitesAndEntities"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Sedes y Entidades" />
            <PrincipalEntitieManagement />
        </ModulesLayout>
    );
}
