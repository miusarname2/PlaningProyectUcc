import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalProfile from '@/pages/UsersRoleManagement/PrincipalProfile';
import { Head } from '@inertiajs/react';

export default function ProfileManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de perfiles"
            backTo="/usersRole"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="ProfileManagement" />
            <PrincipalProfile />
        </ModulesLayout>
    );
}
