import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalProfessonalsManagement from '@/Pages/SpacialityAndProfessionals/PrincipalProfessonalsManagement';
import { Head } from '@inertiajs/react';

export default function PrincipalProfessonals({ auth }) {
    return (
        <ModulesLayout
            title="Gestión Profesionales"
            backTo="/specialtyProfessional"
            exitTo="/dashboard"
            exitText="Salir"
        >
            <Head title="Gestión de especialialidades y profesionales" />
            <PrincipalProfessonalsManagement />
        </ModulesLayout>
    );
}
