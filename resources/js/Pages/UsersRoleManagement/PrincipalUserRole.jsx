import CardLinkModule from '@/Components/CardLinkModule';
import HeaderDescription from '@/Components/HeaderDescription';
import { Users, UserCog, FileText } from 'lucide-react';

export default function PrincipalUserRole() {
    return (
        <div className='space-y-8'>
            <HeaderDescription
                icon={Users}
                title={"Gestión de usuarios y roles"}
                description={"Seleccione una de las siguientes opciones para gestionar la información y los privilegios de los usuarios"}
            />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <CardLinkModule
                    icon={Users}
                    to="/usersRole/users"
                    bgCircle="bg-blue-100"
                    iconColor="text-blue-600"
                    title="Gestión de usuarios"
                    description="Añadir, editar o eliminar usuarios y gestionar su información básica y el acceso al sistema."
                />
                <CardLinkModule
                    icon={UserCog}
                    to="/usersRole/roles"
                    bgCircle="bg-indigo-100"
                    iconColor="text-indigo-600"
                    title="Gestión de roles"
                    description="Añadir, editar o eliminar usuarios y gestionar su información básica y el acceso al sistema."
                />
                <CardLinkModule
                    icon={FileText}
                    to="/usersRole/profile"
                    bgCircle="bg-purple-100"
                    iconColor="text-purple-600"
                    title="User Management"
                    description="Añadir, editar o eliminar usuarios y gestionar su información básica y el acceso al sistema."
                />
            </div>
        </div>
    );
}
