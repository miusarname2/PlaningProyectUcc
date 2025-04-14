import NavbarModules from "@/Components/NavbarModules";
import Footer from "@/Components/Footer";

export default function ModulesLayout({
    title,
    backTo,
    exitTo,
    exitText,
    children,
    customHeader = null,
}) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {customHeader ? (
                customHeader
            ) : (
                <NavbarModules
                    title={title}
                    backTo={backTo}
                    exitTo={exitTo}
                    exitText={exitText}
                />
            )}

            <div className="flex-1 flex flex-row">
                <main
                    className={`flex-1 w-full ${
                        customHeader ? "p-0" : "p-6 md:p-10"
                    }`}
                >
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
}
