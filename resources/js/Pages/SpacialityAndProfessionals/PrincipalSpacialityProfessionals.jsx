import CardLinkModule from '@/Components/CardLinkModule';
import HeaderDescription from '@/Components/HeaderDescription';
import { Users, UserCog, UserPlus,Briefcase  } from 'lucide-react';

export default function PrincipalSpacialityProfessionals() {
    return (
        <div className='space-y-8'>
            <HeaderDescription
                icon={Briefcase}
                title={"Gestión de especialialidades y profesionales"}
                description={"Seleccione una de las siguientes opciones para gestionar especialidades y profesionales."}
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <CardLinkModule
                    icon={Briefcase}
                    to="/specialtyProfessional/spaciality"
                    bgCircle="bg-blue-100"
                    iconColor="text-blue-600"
                    title="Gestión de especialialidades"
                    description="Añadir, editar o eliminar especialidades y gestionar su información."
                />
                <CardLinkModule
                    icon={UserPlus}
                    to="/specialtyProfessional/professionals"
                    bgCircle="bg-indigo-100"
                    iconColor="text-indigo-600"
                    title="Gestión de profesionales"
                    description="Gestionar a los profesionales y asignarlos a especialidades"
                />
            </div>
        </div>
    );
}
