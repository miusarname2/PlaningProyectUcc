import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalProccess from '@/Pages/ProccessManagement/PrincipalProccess';
import { Head } from '@inertiajs/react';

export default function ProccessManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de procesos"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de procesos" />
            <PrincipalProccess />
        </ModulesLayout>
    );
}
