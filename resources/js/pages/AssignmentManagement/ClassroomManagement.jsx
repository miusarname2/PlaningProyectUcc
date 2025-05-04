import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalClassroom from '@/pages/ClassroomManagement/PrincipalClassroom';
import { Head } from '@inertiajs/react';

export default function ClassroomManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Aulas"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestion de Aula" />
            <PrincipalClassroom />
        </ModulesLayout>
    );
}
