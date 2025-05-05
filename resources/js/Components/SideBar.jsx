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
  CalendarDays,
  HardHat
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
function filterSectionsByPermissions(sections, permissionsJsonArray, keywordMap, allowedLevels = ['manage']) {
  // 1. Parsear y combinar todos los permisos JSON
  const perms = Object.assign(
    {},
    ...permissionsJsonArray.map(str => {
      try { return JSON.parse(str); }
      catch (e) { console.warn('JSON inválido:', str); return {}; }
    })
  );


  // 2. Auxiliar: comprueba keyword + nivel de permiso
  const hasPermissionFor = (keywords) => {
    return keywords.some(kw =>
      Object.entries(perms).some(([permKey, allowed]) => {
        // sólo niveles permitidos (p.ej. '_manage')
        const suffixOk = allowedLevels.some(lvl =>
          permKey.toLowerCase().endsWith(`_${lvl}`)
        );
        // y que el permKey contenga la keyword
        return allowed === true
          && suffixOk
          && permKey.toLowerCase().includes(kw.toLowerCase());
      })
    );
  };

  // 3. Filtrar cada sección
  return sections.reduce((out, section) => {
    const opts = section.options.filter(opt => {
      const kws = keywordMap[opt.to] || [];
      return kws.length > 0 && hasPermissionFor(kws);
    });
    if (opts.length) {
      out.push({ ...section, options: opts });
    }
    return out;
  }, []);
}


const permissionStrings = responsePermisos.data.permisos

const keywordMap = {
  '/usersRole': ['users', 'roles', 'profiles'],
  '/regionManagement': ['region_management'],
  '/citiesManagement': ['cities_management'],
  '/countriesManagement': ['country_management'],
  '/sitesAndEntities': ['branches', 'entities'],
  '/locationManagement': ['location', 'region_management', 'cities_management', 'country_management'],
  '/specialtyProfessional/professionals': ['professionals', 'area', 'specialty'],
  '/specialtyProfessional/area': ['area', 'specialty'],
  '/batchManagement': ['batches'],
  '/programmeManagement': ['program'],   // ahora busca "programs" o "program"
  '/slotManagement': ['slots', 'slot'],
  '/processManagement': ['processes', 'process'],
  '/classroomManagement': ['classroom'],
  '/course': ['course', 'courses'],
  '/classManagement': ['class', 'classes'],
  '/scheduleTimer': ['schedule', 'timetable'],
  '/settings': ['settings'],
};


let sections = [
  {
    title: 'Administración',
    basePath: '/admin/city',
    options: [
      { text: 'Usuarios y Permisos', icon: Users, to: '/usersRole' },
      { text: 'Gestión de Ubicacion', icon: MapPin, to: '/locationManagement' },
      { text: 'Sedes y Entidades', icon: Building, to: '/sitesAndEntities' },
      { text: 'Gestión de Aula', icon: LayoutGrid, to: '/classroomManagement' },
      { text: 'Gestión de Programas', icon: BookOpen, to: '/programmeManagement' },
      { text: 'Gestión por Lotes', icon: Layers, to: '/batchManagement' },
      { text: 'Gestión de Cursos', icon: BookOpen, to: '/course' },
      { text: 'Gestion de Clases', icon: CalendarDays, to: '/classManagement' },
      { text: 'Gestion de Profesionales', icon: Briefcase, to: '/specialtyProfessional/professionals' },
      { text: 'Cronograma de Horarios', icon: Timer, to: '/scheduleTimer' },
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

export const filtered = filterSectionsByPermissions(sections, permissionStrings, keywordMap, ['read', 'edit', 'create', 'delete', 'manage']);

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
