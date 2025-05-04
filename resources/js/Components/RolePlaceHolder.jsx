import AddRoleButton from "@/Components/AddRoleButton";

export default function RolePlaceHolder({ icon: Icon, title, description, onAddRole }) {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center p-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 mb-4">{description}</p>
                <div className="w-fit mx-auto">
                    <AddRoleButton
                        text="Crear Nuevo Permiso"
                        onClick={onAddRole}
                        className="w-fit mt-0 border border-solid"
                    />
                </div>
            </div>
        </div>
    );
}
