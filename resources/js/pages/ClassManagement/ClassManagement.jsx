import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalClass from '@/pages/ClassManagement/PrincipalClass';
import { Head } from '@inertiajs/react';

export default function ClassManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestion de Clases"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestion de Clases" />
            <PrincipalClass />
        </ModulesLayout>
    );
}
