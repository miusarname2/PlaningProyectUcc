import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalRole from '@/Pages/UsersRoleManagement/PrincipalRole';
import { Head } from '@inertiajs/react';

export default function RoleManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de usuarios y roles"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="RolesManagement" />
            <PrincipalRole />
        </ModulesLayout>
    );
}
