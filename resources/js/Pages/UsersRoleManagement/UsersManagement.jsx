import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalUser from '@/Pages/UsersRoleManagement/PrincipalUser';
import { Head } from '@inertiajs/react';

export default function UsersRoleManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de usuarios y roles"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="UsersManagement" />
            <PrincipalUser />
        </ModulesLayout>
    );
}
