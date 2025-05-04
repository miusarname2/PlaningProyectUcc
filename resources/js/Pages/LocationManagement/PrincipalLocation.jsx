import CardLinkModule from '@/Components/CardLinkModule';
import HeaderDescription from '@/Components/HeaderDescription';
import { Building2, Earth, Landmark,MapPin } from 'lucide-react';

export default function PrincipalLocation() {
    return (
        <div className='space-y-8'>
            <HeaderDescription
                icon={MapPin}
                title={"Gestión de Ubicacion"}
                description={"Seleccione una de las siguientes opciones para gestionar Ubicacion"}
            />
            <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                <CardLinkModule
                    icon={Earth}
                    to="/locationManagement/countriesManagement"
                    bgCircle="bg-blue-100"
                    iconColor="text-blue-600"
                    title="Gestión de Pais"
                    description="Añadir, editar o eliminar sedes y gestionar su información básica."
                />
                <CardLinkModule
                    icon={MapPin}
                    to="/locationManagement/regionManagement"
                    bgCircle="bg-indigo-100"
                    iconColor="text-indigo-600"
                    title="Gestión de Regiones"
                    description="Crear y configurar entidades asociadas con sedes"
                />
                <CardLinkModule
                    icon={Landmark}
                    to="locationManagement/department"
                    bgCircle="bg-indigo-100"
                    iconColor="text-indigo-600"
                    title="Gestion de Departamentos"
                    description="Crear y configurar entidades asociadas con sedes"
                />
                <CardLinkModule
                    icon={Building2}
                    to="/locationManagement/citiesManagement"
                    bgCircle="bg-indigo-100"
                    iconColor="text-indigo-600"
                    title="Gestión de Ciudad"
                    description="Crear y configurar entidades asociadas con sedes"
                />
            </div>
        </div>
    );
}
