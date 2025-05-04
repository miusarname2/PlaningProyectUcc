import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';
import ButtonGradient from '@/Components/ButtonGradient';

export default function NavbarModules({ title, backTo = '/', exitTo = '/', exitText = 'Exit' }) {
    return (
        <nav className="bg-white ">
            <div className="h-[60px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-[60px] items-center">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.visit(backTo)}
                            className="text-gray-700 hover:text-indigo-600"
                        >
                            <ArrowLeft />
                        </button>
                        <div className="md:block">
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                {title}
                            </h1>
                        </div>
                    </div>
                    <div className="sm:flex sm:items-center sm:ms-6">
                        <ButtonGradient onClick={() => router.visit(exitTo)}>
                            {exitText}
                        </ButtonGradient>
                    </div>
                </div>
            </div>
        </nav>
    );
}
