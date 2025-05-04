import ModulesLayout from '@/Layouts/ModulesLayout';
import PrincipalCourse from '@/pages/CourseManagement/PrincipalCourse';
import { Head } from '@inertiajs/react';

export default function CourseManagement({ auth }) {
    return (
        <ModulesLayout
            title="Gestión de Cursos"
            backTo="/dashboard"
            exitTo="/dashboard"
            exitText="Salir"
        >

            <Head title="Gestión de Cursos" />
            <PrincipalCourse />
        </ModulesLayout>
    );
}
