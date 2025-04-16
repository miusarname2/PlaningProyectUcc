import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalRol from '@/Pages/SlotManagement/PrincipalSlot';
import { Head } from '@inertiajs/react';

export default function SlotManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Franja Horarias"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Franjas Horarias" />
            <PrincipalRol />
        </ModulesLayout>
    );
}
