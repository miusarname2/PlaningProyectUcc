import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalRol from '@/Pages/SlotManagement/PrincipalSlot';
import { Head } from '@inertiajs/react';

export default function SlotManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Horario"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Horario" />
            <PrincipalRol />
        </ModulesLayout>
    );
}
