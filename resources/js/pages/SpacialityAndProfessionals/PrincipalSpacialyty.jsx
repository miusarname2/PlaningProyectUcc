import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalSpacialityManagement from '@/pages/SpacialityAndProfessionals/PrincipalSpacialityManagement';
import { Head } from '@inertiajs/react';

export default function PrincipalSpacialyty({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Area"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión Area" />
            <PrincipalSpacialityManagement />
        </ModulesLayout>
    );
}
