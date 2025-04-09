// Components/RowActionsMenu.jsx
import { Ellipsis } from "lucide-react";

export default function RowActionsMenu({ actions = [], rowId, openActionRowId, setOpenActionRowId }) {
  const isOpen = openActionRowId === rowId;

  const toggleMenu = () => {
    setOpenActionRowId(isOpen ? null : rowId);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        <Ellipsis className="w-4 h-4" />
        <span className="sr-only">Acciones</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white shadow-md border">
          {actions.map(({ icon: Icon, label, onClick, danger }, index) => (
            <button
              key={index}
              onClick={() => {
                onClick();
                setOpenActionRowId(null); // Cierra después de acción
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 ${danger ? "text-red-600" : ""
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
