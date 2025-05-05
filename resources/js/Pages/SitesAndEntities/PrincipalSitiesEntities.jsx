import CardLinkModule from '@/Components/CardLinkModule';
import HeaderDescription from '@/Components/HeaderDescription';
import { Users, UserCog, FileText,Building } from 'lucide-react';

export default function PrincipalUserRole() {
    return (
        <div className='space-y-8'>
            <HeaderDescription
                icon={Building}
                title={"Gestión de Sedes y Entidades"}
                description={"Seleccione una de las siguientes opciones para gestionar sedes y entidades"}
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <CardLinkModule
                    icon={FileText}
                    to="/sitesAndEntities/entities"
                    bgCircle="bg-indigo-100"
                    iconColor="text-indigo-600"
                    title="Gestión de Entidades"
                    description="Crear y configurar entidades asociadas con sedes"
                />
                <CardLinkModule
                    icon={Building}
                    to="/sitesAndEntities/sities"
                    bgCircle="bg-blue-100"
                    iconColor="text-blue-600"
                    title="Gestión de Sedes"
                    description="Añadir, editar o eliminar sedes y gestionar su información básica."
                />
            </div>
        </div>
    );
}
