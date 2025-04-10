import RoleButton from "@/Components/RoleButton";
import AddRoleButton from "@/Components/AddRoleButton";

export default function RolesList({ roles = [], selectedRole, onSelectRole, onAddRole, headerText }) {
    console.log(roles)
    return (
        <div className="md:col-span-1">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
                <div className="flex flex-col space-y-1.5 p-6 pb-3">
                    <h3 className="tracking-tight text-lg font-semibold">{headerText}</h3>
                </div>
                <div className="p-6 pt-0">
                    <div className="space-y-2">
                        {roles.map((role, index) => (


                            <RoleButton
                                key={index}
                                title={role.nombre}
                                description={role.descripcion}
                                active={role.idRol === selectedRole?.idRol}
                                onClick={() => onSelectRole(role)}
                            />
                        ))}
                        <AddRoleButton text="Add New Role" className="w-full" onClick={onAddRole} />
                    </div>
                </div>
            </div>
        </div>
    );
}
