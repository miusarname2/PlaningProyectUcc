import NavbarModules from "@/Components/NavbarModules";
import Footer from "@/Components/Footer";

export default function ModulesLayout({ title, backTo, exitTo, exitText, children }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <NavbarModules
                title={title}
                backTo={backTo}
                exitTo={exitTo}
                exitText={exitText}
            />

            <div className="flex-1 flex flex-row">
                <main className="flex-1 p-6 md:p-10 w-full">
                    {children}
                </main>
            </div>

            <Footer />
        </div>
    );
}
