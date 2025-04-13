import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalSpacialityManagement from '@/Pages/SpacialityAndProfessionals/PrincipalSpacialityManagement';
import { Head } from '@inertiajs/react';

export default function PrincipalSpacialyty({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de especialidades"
            backTo="/specialtyProfessional"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión especializadades"/>
            <PrincipalSpacialityManagement />
        </ModulesLayout>
    );
}
