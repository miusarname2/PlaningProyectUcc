import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalBatch from '@/Pages/BatchManagement/PrincipalBatch';
import { Head } from '@inertiajs/react';

export default function BatchManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Lotes"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="BatchManagement" />
            <PrincipalBatch />
        </ModulesLayout>
    );
}
