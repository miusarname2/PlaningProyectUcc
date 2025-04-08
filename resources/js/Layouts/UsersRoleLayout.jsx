import NavbarModules from "@/Components/NavbarModules";
import Footer from "@/Components/Footer";

export default function UsersRoleLayout({ children }) {

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <NavbarModules
                title="Gestión de usuarios y roles"
                backTo="/dashboard"
                exitTo="/dashboard"
                exitText="Salir"
            />

            <div className="flex-1 flex flex-row">

                <main className="flex-1 p-6 md:p-10">{children}</main>
            </div>
            <Footer />
        </div>
    );
}
