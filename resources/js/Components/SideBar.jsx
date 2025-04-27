import React from 'react';
import OptionSideBar from '@/Components/OptionSideBar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    MapPin, Users, BookOpen, Settings, Building,
    Briefcase, Calendar, Layers, Clock, SendToBack,
    LayoutGrid, UserRoundCheck,
    Timer,
    Earth,
    Map,
    CalendarDays
} from 'lucide-react';
import { getApi } from '@/utils/generalFunctions';

const api = getApi();
var email = localStorage.getItem("Email");
const response = await api.get(`/user/search?email=${encodeURIComponent(email)}`);
const idUsuario = response.data.data.data[0].idUsuario;
const responsePermisos = await api.get(`/user/${idUsuario}/permisos`);
/**
 * Filtra el array de secciones según los permisos.
 * @param {Array} sections – tu array original de secciones/options.
 * @param {string[]} permissionsJsonArray – array de JSON strings, e.g. ['{"users_read":true}', ...].
 * @param {Object<string,string[]>} keywordMap – mapeo de cada `option.to` a sus keywords.
 * @returns {Array} – nuevo array de secciones filtrado.
 */
function filterSectionsByPermissions(sections, permissionsJsonArray, keywordMap) {
  // 1. Parsear y combinar permisos
  const perms = Object.assign(
    {},
    ...permissionsJsonArray.map(str => {
      try { return JSON.parse(str); }
      catch (e) { console.warn('JSON inválido:', str); return {}; }
    })
  );

  // 2. Función auxiliar: comprueba si alguna keyword está activa en perms
  const hasPermissionFor = (keywords) =>
    keywords.some(kw =>
      Object.entries(perms).some(([permKey, allowed]) =>
        allowed === true && permKey.includes(kw)
      )
    );

  // 3. Iterar y filtrar
  return sections.reduce((outSections, section) => {
    const filteredOptions = section.options.filter(opt => {
      const kws = keywordMap[opt.to] || [];
      return hasPermissionFor(kws);
    });

    if (filteredOptions.length > 0) {
      outSections.push({
        ...section,
        options: filteredOptions
      });
    }

    return outSections;
  }, []);
}

const permissionStrings = responsePermisos.data.permisos

const keywordMap = {
  '/usersRole':                      ['users', 'roles', 'profiles'],
  '/regionManagement':               ['region_management'],
  '/citiesManagement':               ['cities_management'],
  '/countriesManagement':            ['country_management'],
  '/sitesAndEntities':               ['branches', 'entities'],
  '/specialtyProfessional/professionals': ['specialty', 'professionals'],
  '/batchManagement':                ['batches'],
  '/programmeManagement':            ['programme'],
  '/slotManagement':                 ['slot'],
  '/processManagement':              ['process'],
  '/classroomManagement':            ['classroom'],
  '/scheduleTimer':                  ['schedule'],
  '/course':                         ['course'],
  '/classManagement':                ['class'],
  '/settings':                       ['settings'],
};


let sections = [
    {
        title: 'Administración',
        basePath: '/admin/city',
        options: [
            { text: 'Usuarios y Roles', icon: Users, to: '/usersRole' },
            { text: 'Gestión de Region', icon: Map, to:'/regionManagement' },
            { text: 'Gestión de Ciudades', icon: MapPin, to: '/citiesManagement' },
            { text: 'Gestión de Pais', icon: Earth, to:'/countriesManagement' },             
            { text: 'Sedes y Entidades', icon: Building, to:'/sitesAndEntities' },
            { text: 'Gestion de Profesionales', icon: Briefcase, to:'/specialtyProfessional/professionals' },
            { text: 'Gestión por Lotes', icon: Layers, to: '/batchManagement' },
            { text: 'Gestión de Programas', icon: BookOpen, to: '/programmeManagement' },
            { text: 'Gestión de Slots', icon: Clock, to: '/slotManagement' },
            { text: 'Gestión de Procesos', icon: SendToBack, to: '/processManagement' },
            { text: 'Gestión de Aula', icon: LayoutGrid, to:'/classroomManagement' },
            { text: 'Cronograma de Horarios', icon: Timer, to: '/scheduleTimer' },
        ],
    },
    {
        title: 'Cursos',
        basePath: '/courses/create',
        options: [
            { text: 'Gestión de Sector o Area', icon: BookOpen, to: '/specialtyProfessional/area' },  
            { text: 'Gestión de Cursos', icon: BookOpen, to: '/course' },
            { text: 'Gestion de Clases', icon: CalendarDays, to:'/classManagement' },
        ],
    },
    {
        title: 'Sistema',
        basePath: '/courses/create',
        options: [
            { text: 'Ajustes', icon: Settings, to: '/settings' },
        ],
    },
];

console.log(permissionStrings);
export const filtered = filterSectionsByPermissions(sections, permissionStrings, keywordMap);

sections = filtered;
export default function SideBar({ isOpen, onClose }) {
    return (
        <>
            {isOpen && (
                <div
                    onClick={onClose}
                    className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
                />
            )}

            <aside className={`
                fixed top-0 left-0 h-full md:h-auto w-64 bg-white shadow-lg z-40
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:block
                `}>
                <div className="h-full  p-4 overflow-y-auto scroll-smooth">
                    <div className="md:hidden flex justify-between items-center mb-6 flex-col gap-2">
                        <ApplicationLogo textColor="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent" />
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
                    </div>

                    <nav className="space-y-6 h-full ">
                        {sections.map(({ title, options, basePath }, i) => (
                            <div key={i}>
                                <h3 className="text-xs font-semibold text-gray-600 px-2 mb-1 uppercase">{title}</h3>
                                <ul className="space-y-1">
                                    {options.map(({ text, icon, to }, j) => (
                                        <OptionSideBar
                                            key={j}
                                            icon={icon}
                                            text={text}
                                            to={to || basePath}
                                        />
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
