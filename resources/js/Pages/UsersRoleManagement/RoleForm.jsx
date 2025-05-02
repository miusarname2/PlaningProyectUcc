import { useState, useEffect } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import CancelButton from '@/Components/CancelButton';
import ButtonGradient from "@/Components/ButtonGradient";
import CheckboxInput from '@/Components/CheckboxInput';
import { Save } from 'lucide-react';
import { getApi } from '@/utils/generalFunctions';

export default function RoleForm({ onCancel, onSubmit, role }) {
    // Define modules and labels
    const modules = [
        { key: 'users', label: 'Usuarios' },
        { key: 'roles', label: 'Gestion de Roles' },
        { key: 'profiles', label: 'Gestion de Perfiles' },
        { key: 'region_management', label: 'Gestion de Region' },
        { key: 'cities_management', label: 'Gestion de Ciudad' },
        { key: 'country_management', label: 'Gestion de Pais' },
        { key: 'entities', label: 'Gestion de Entidades' },
        { key: 'professionals_management', label: 'Gestion de Profesionales' },
        { key: 'batches_management', label: 'Gestion de Lotes' },
        { key: 'programs_management', label: 'Gestion de Programas' },
        { key: 'classroom_management', label: 'Gestion de Aulas' },
        { key: 'courses_management', label: 'Gestion de Cursos' },
        { key: 'classes_management', label: 'Gestion de Clases' },
        { key: 'area_management', label: 'Gestion de Area' },
        { key: 'location_management', label: 'Gestion de Ubicacion' }
    ];

    // Permission levels
    const levels = ['read', 'edit', 'create', 'delete', 'manage'];

    // Label generator
    const getLabel = (modLabel, level) => {
        const lvl = level.charAt(0).toUpperCase() + level.slice(1);
        return `${lvl} ${modLabel}`;
    };

    // Form state
    const [form, setForm] = useState({ name: '', description: '', permissions: {} });

    // Accordion state: which module is open
    const [openModule, setOpenModule] = useState(null);

    // Load existing role
    useEffect(() => {
        if (role) {
            setForm({
                name: role.nombre || '',
                description: role.descripcion || '',
                permissions: role.permisos ? JSON.parse(role.permisos) : {}
            });
        } else {
            setForm({ name: '', description: '', permissions: {} });
        }
        setOpenModule(null);
    }, [role]);

    // Text inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    // Permission toggles
    const handlePermissionToggle = (modKey, level) => {
        setForm(prev => {
            const base = { ...prev.permissions };
            const permKey = `${modKey}_${level}`;
            const newValue = !base[permKey];

            if (level === 'manage') {
                levels.forEach(lv => delete base[`${modKey}_${lv}`]);
                base[permKey] = true;
            } else {
                if (base[`${modKey}_manage`]) delete base[`${modKey}_manage`];
                base[permKey] = newValue;
            }
            return { ...prev, permissions: base };
        });
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        const api = getApi();
        const payload = {
            nombre: form.name,
            descripcion: form.description,
            permisos: JSON.stringify(form.permissions)
        };
        try {
            let response;
            if (role && role.idRol) {
                response = await api.put(`/rol/${role.idRol}`, payload);
                console.log('Rol actualizado:', response.data);
            } else {
                response = await api.post('/rol', payload);
                console.log('Rol creado:', response.data);
            }
            onSubmit?.(form);
            setForm({ name: '', description: '', permissions: {} });
        } catch (error) {
            console.error('Error al guardar el rol:', error.response?.data?.errors || error);
        }
    };

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 pb-3">
                <h3 className="text-lg font-semibold">
                    {role ? 'Editar Permiso' : 'Crear Nuevo Permiso'}
                </h3>
            </div>
            <div className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name & Description */}
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="name">Nombre del Permiso</InputLabel>
                            <TextInput
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Ingrese nombre del Permiso"
                                required
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="description">Descripción</InputLabel>
                            <TextInput
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Ingrese descripción del Permiso"
                            />
                        </div>
                    </div>

                    {/* Permissions Accordion */}
                    <div className="pt-4">
                        <InputLabel>Permisos por Modulo</InputLabel>
                        <div className="space-y-2">
                            {modules.map(({ key, label }) => (
                                <div key={key} className="border rounded">
                                    <button
                                        type="button"
                                        className="w-full flex justify-between items-center p-3 focus:outline-none"
                                        onClick={() => setOpenModule(openModule === key ? null : key)}
                                    >
                                        <span className="font-medium">{label}</span>
                                        <span className="transform transition-transform duration-200">
                                            {openModule === key ? '▾' : '▸'}
                                        </span>
                                    </button>
                                    {openModule === key && (
                                        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {levels.map(level => {
                                                const permKey = `${key}_${level}`;
                                                return (
                                                    <CheckboxInput
                                                        key={permKey}
                                                        id={permKey}
                                                        label={getLabel(label, level)}
                                                        checked={!!form.permissions[permKey]}
                                                        onChange={() => handlePermissionToggle(key, level)}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <CancelButton onClick={onCancel}>Cancelar</CancelButton>
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
