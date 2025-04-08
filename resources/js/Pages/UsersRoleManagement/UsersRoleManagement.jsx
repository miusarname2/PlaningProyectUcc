import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalUserRole from '@/Pages/UsersRoleManagement/PrincipalUserRole';
import { Head } from '@inertiajs/react';

export default function UsersRoleManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de usuarios y roles"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="UsersRoleManagement" />
            <PrincipalUserRole />
        </ModulesLayout>
    );
}
