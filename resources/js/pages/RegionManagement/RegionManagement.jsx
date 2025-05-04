import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalRegion from '@/pages/RegionManagement/PrincipalRegion';
import { Head } from '@inertiajs/react';

export default function CityManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Regiones"
            backTo="/locationManagement"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Regiones" />
            <PrincipalRegion />
        </ModulesLayout>
    );
}
