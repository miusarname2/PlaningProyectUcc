import UsersRoleLayout from '@/Layouts/UsersRoleLayout';
import PrincipalUserRole from '@/Pages/UsersRoleManagement/PrincipalUserRole';
import { Head } from '@inertiajs/react';

export default function UsersRoleManagement({ auth }) {
    return (
        <UsersRoleLayout
            // user={auth.user} 
        >
            <Head title="UsersRoleManagement" />
            {/* <div className='h-full flex-col flex '>
                <div className="p-8 my-auto">
                </div>
            </div> */}
            <PrincipalUserRole/>
        </UsersRoleLayout>
    );
}
