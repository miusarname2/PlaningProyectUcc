import { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import CancelButton from '@/Components/CancelButton';
import ButtonGradient from "@/Components/ButtonGradient";
import CheckboxInput from '@/Components/CheckboxInput';
import { Save } from 'lucide-react';
import { getApi } from '@/utils/generalFunctions';

export default function RoleForm({ onCancel, onSubmit, role }) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        permissions: {},
    });

    useEffect(() => {
        if (role) {
            setForm({
                name: role.nombre || '',
                description: role.descripcion || '',
                permissions: role.permisos ? JSON.parse(role.permisos) : {},
            });
        } else {
            setForm({
                name: '',
                description: '',
                permissions: {},
            });
        }
    }, [role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handlePermissionToggle = (perm) => {
        setForm((prev) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [perm]: !prev.permissions[perm],
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const api = getApi();

        Object.entries(form.permissions)
            .filter(([_, isSelected]) => isSelected)
            .map(([perm]) => perm);

        const payload = {
            nombre: form.name,
            descripcion: form.description,
            permisos: JSON.stringify(form.permissions),
        };

        try {
            let response;
            if (role && role.idRol) {
                response = await api.put(`/rol/${role.idRol}`, payload);
                console.log('Rol actualizado exitosamente:', response.data);
            } else {
                response = await api.post('/rol', payload);
                console.log('Rol creado exitosamente:', response.data);
            }
    
            if (onSubmit) {
                onSubmit(form);  
                setForm({        
                    name: '',
                    description: '',
                    permissions: {},
                });
            }
        } catch (error) {
            if (error.response && error.response.data.errors) {
                console.error('Errores de validación:', error.response.data.errors);
            } else {
                console.error('Error al guardar el rol:', error);
            }
        }
    };

    const permissionGroups = {
        'User Management': ['users_view', 'users_create', 'users_edit', 'users_delete'],
        'Role Management': ['roles_view', 'roles_manage'],
        'Profile Management': ['profiles_view', 'profiles_manage'],
    };

    const permissionLabels = {
        users_view: 'Ver usuarios',
        users_create: 'Crear usuarios',
        users_edit: 'Editar usuarios',
        users_delete: 'Eliminar usuarios',
        roles_view: 'Ver roles',
        roles_manage: 'Gestionar funciones',
        profiles_view: 'Ver perfiles',
        profiles_manage: 'Gestionar perfiles',
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-3">
                <h3 className="tracking-tight text-lg font-semibold">
                    {role ? 'Editar Rol' : 'Crear Nuevo Rol'}
                </h3>
            </div>
            <div className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <InputLabel htmlFor="name">Nombre del Rol</InputLabel>
                            <TextInput id="name" name="name" value={form.name} onChange={handleChange} placeholder="Ingrese nombre del rol" required />
                        </div>
                        <div className="space-y-2">
                            <InputLabel htmlFor="description">Descripción</InputLabel>
                            <TextInput id="description" name="description" value={form.description} onChange={handleChange} placeholder="Ingrese descripción del rol" />
                        </div>

                        <div className="space-y-4 pt-4">
                            <InputLabel>Permisos</InputLabel>
                            {Object.entries(permissionGroups).map(([groupName, perms]) => (
                                <div className="space-y-2" key={groupName}>
                                    <h4 className="text-sm font-medium text-gray-700">{groupName}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                                        {perms.map((perm) => (
                                            <CheckboxInput
                                                key={perm}
                                                id={perm}
                                                label={permissionLabels[perm]}
                                                checked={!!form.permissions[perm]}
                                                onChange={() => handlePermissionToggle(perm)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>
                            Cancelar
                        </CancelButton>
                        <ButtonGradient type="submit">
                            <Save className="h-4 w-4 mr-2" />
                            {role ? 'Guardar Cambios' : 'Crear Rol'}
                        </ButtonGradient>

                    </div>
                </form>
            </div>
        </div>
    );
}
