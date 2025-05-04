import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalSpacialityProfessionals from '@/Pages/SpacialityAndProfessionals/PrincipalSpacialityProfessionals';
import { Head } from '@inertiajs/react';

export default function SpacialityAndProfessionals({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de especialialidades y profesionales"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de especialialidades y profesionales" />
            <PrincipalSpacialityProfessionals />
        </ModulesLayout>
    );
}
