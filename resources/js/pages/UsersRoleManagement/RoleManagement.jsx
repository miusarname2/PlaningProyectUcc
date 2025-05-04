import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalRole from '@/pages/UsersRoleManagement/PrincipalRole';
import { Head } from '@inertiajs/react';

export default function RoleManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de usuarios y Permisos"
            backTo="/usersRole"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestion de Permisos" />
            <PrincipalRole />
        </ModulesLayout>
    );
}
