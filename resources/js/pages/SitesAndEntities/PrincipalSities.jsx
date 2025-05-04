import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalSitiesManagement from '@/pages/SitesAndEntities/PrincipalSitiesManagement';
import { Head } from '@inertiajs/react';

export default function PrincipalSities({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Sedes"
            backTo="/sitesAndEntities"
            exitTo="/dashboard"
            exitText="Salir"
        >
            <Head title="Gestión de Sedes y Entidades" />
            <PrincipalSitiesManagement />
        </ModulesLayout>
    );
}
