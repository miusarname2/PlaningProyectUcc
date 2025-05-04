import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalSitiesEntities from '@/Pages/SitesAndEntities/PrincipalSitiesEntities';
import { Head } from '@inertiajs/react';

export default function SitesAndEntities({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Sedes y Entidades"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Sedes y Entidades" />
            <PrincipalSitiesEntities />
        </ModulesLayout>
    );
}
