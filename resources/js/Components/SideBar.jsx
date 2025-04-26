import React, { useState, useEffect } from 'react';
import OptionSideBar from '@/Components/OptionSideBar';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
  MapPin, Users, BookOpen, Settings, Building,
  Briefcase, CalendarDays, Layers, Clock, SendToBack,
  LayoutGrid, Timer, Earth
} from 'lucide-react';
import { getApi } from '@/utils/generalFunctions';

const api = getApi();

// Mapeo de keywords para permisos
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

// Definición estática de secciones
const initialSections = [
  {
    title: 'Administración',
    options: [
      { text: 'Usuarios y Roles', icon: Users, to: '/usersRole' },
      { text: 'Gestión de Region', icon: MapPin, to: '/regionManagement' },
      { text: 'Gestión de Ciudades', icon: MapPin, to: '/citiesManagement' },
      { text: 'Gestión de Pais', icon: Earth, to: '/countriesManagement' },
      { text: 'Sedes y Entidades', icon: Building, to: '/sitesAndEntities' },
      { text: 'Gestion de Profesionales', icon: Briefcase, to: '/specialtyProfessional/professionals' },
      { text: 'Gestión por Lotes', icon: Layers, to: '/batchManagement' },
      { text: 'Gestión de Programas', icon: BookOpen, to: '/programmeManagement' },
      { text: 'Gestión de Slots', icon: Clock, to: '/slotManagement' },
      { text: 'Gestión de Procesos', icon: SendToBack, to: '/processManagement' },
      { text: 'Gestión de Aula', icon: LayoutGrid, to: '/classroomManagement' },
      { text: 'Cronograma de Horarios', icon: Timer, to: '/scheduleTimer' },
    ],
  },
  {
    title: 'Cursos',
    options: [
      { text: 'Gestión de Cursos', icon: BookOpen, to: '/course' },
      { text: 'Gestion de Clases', icon: CalendarDays, to: '/classManagement' },
    ],
  },
  {
    title: 'Sistema',
    options: [
      { text: 'Ajustes', icon: Settings, to: '/settings' },
    ],
  },
];

// Filtrado según permisos
function filterSectionsByPermissions(sections, permissionsJsonArray) {
  const perms = Object.assign(
    {},
    ...permissionsJsonArray.map(str => {
      try { return JSON.parse(str); }
      catch { return {}; }
    })
  );

  const hasPermissionFor = (keywords) =>
    keywords.some(kw =>
      Object.entries(perms).some(([key, allowed]) => allowed && key.includes(kw))
    );

  return sections
    .map(section => ({
      ...section,
      options: section.options.filter(opt => hasPermissionFor(keywordMap[opt.to] || []))
    }))
    .filter(section => section.options.length > 0);
}

export default function SideBar({ isOpen, onClose }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem('Email');
    api.get(`/user/search?email=${encodeURIComponent(email)}`)
      .then(userRes => {
        const idUsuario = userRes.data.data.data[0].idUsuario;
        return api.get(`/user/${idUsuario}/permisos`);
      })
      .then(permRes => {
        setSections(filterSectionsByPermissions(initialSections, permRes.data.permisos));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return null; // O un spinner mientras carga
  }

  return (
    <>
      {isOpen && (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" />
      )}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:block`}>
        <div className="p-4 overflow-y-auto">
          <div className="md:hidden flex justify-between items-center mb-6">
            <ApplicationLogo textColor="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent" />
            <button onClick={onClose} className="text-gray-600 hover:text-gray-800">✕</button>
          </div>

          <nav className="space-y-6">
            {sections.map(({ title, options }, i) => (
              <div key={i}>
                <h3 className="text-xs font-semibold text-gray-600 px-2 mb-1 uppercase">{title}</h3>
                <ul className="space-y-1">
                  {options.map(({ text, icon: Icon, to }, j) => (
                    <OptionSideBar key={j} icon={Icon} text={text} to={to} />
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
