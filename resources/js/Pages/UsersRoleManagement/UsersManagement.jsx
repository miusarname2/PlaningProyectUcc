import { filtered } from '@/Components/SideBar';
import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalUser from '@/Pages/UsersRoleManagement/PrincipalUser';
import { RouteGuard } from '@/utils/RouteGuard';
import { Head } from '@inertiajs/react';

export default function UsersRoleManagement({ auth }) {
    return (
        <RouteGuard filteredSections={filtered}>
            <ModulesLayout
            title="Gestión de usuarios y Permisos"
            backTo="/usersRole"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="UsersManagement" />
            <PrincipalUser />
        </ModulesLayout>
        </RouteGuard>
    );
}
