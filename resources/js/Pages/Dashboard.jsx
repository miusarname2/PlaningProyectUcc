import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import SvgHeader from '@/Components/SvgHeader';
import IconsGroup from '@/Components/IconsGroup';

export default function Dashboard({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user} 
        >
            <Head title="Dashboard" />
            <div className='h-full flex-col flex '>
                <SvgHeader />
                <div className="p-8 my-auto">
                    <IconsGroup />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
