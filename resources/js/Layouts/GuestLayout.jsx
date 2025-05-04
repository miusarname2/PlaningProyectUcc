import { BookOpen, Calendar, ClipboardList, LayoutGrid, Users } from "lucide-react"
import InfoCardLogin from "@/Components/InfoCardLogin";
import ApplicationLogo from "@/Components/ApplicationLogo";


export default function Guest({ children }) {
    return (
        <div className="min-h-screen  flex  sm:justify-center flex flex-1 items-center justify-center bg-gradient-to-b from-white to-blue-50/50 md:bg-white pt-6 sm:pt-0">
            <div className="w-full relative  min-h-screen px-8 hidden md:flex justify-center items-center flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full opacity-10 absolute -top-20 -left-20"></div>
                <div className="w-96 h-96 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full opacity-10 absolute -bottom-40 -right-20"></div>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">PlanningProject</h1>
                    <p className="text-gray-600 max-w-md">Simplificación de la gestión de aulas y Bootcamps para educadores y estudiantes</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InfoCardLogin
                        icon={<BookOpen />}
                        iconColor="text-blue-600"
                        circleColor="bg-blue-100"
                        text="Gestión de cursos"
                    />
                    <InfoCardLogin
                        icon={<Users />}
                        iconColor="text-indigo-600"
                        circleColor="bg-blue-100"
                        text="Seguimiento de estudiantes"
                    />
                    <InfoCardLogin
                        icon={<ClipboardList />}
                        iconColor="text-purple-600"
                        circleColor="bg-blue-100"
                        text="Calificación de las tareas"
                    />
                    <InfoCardLogin
                        icon={<Calendar />}
                        iconColor="text-blue-600"
                        circleColor="bg-blue-100"
                        text="Planificación de horarios"
                    />
                </div>
            </div>
            <div className="w-full z-100 px-8 justify-center flex flex-col items-center z-100 min-h-screen">
                <ApplicationLogo />


                <div className='mt-6 text-center md:text-left w-full max-w-md justify-center flex flex-col align-items-center'>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido de nuevo</h1>
                    <p className="mt-2 text-muted-foreground">Inicie sesión para acceder a su cuenta</p>
                </div>
                <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white  shadow-sm overflow-hidden sm:rounded-lg border border-border/40">
                    {children}
                </div>
            </div>
        </div>
    );
}
