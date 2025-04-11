import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalProgramme from '@/Pages/ProgrammeManagement/PrincipalProgramme';
import { Head } from '@inertiajs/react';

export default function ProgrammeManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de programas"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="ProgrammeManagement" />
            <PrincipalProgramme />
        </ModulesLayout>
    );
}
