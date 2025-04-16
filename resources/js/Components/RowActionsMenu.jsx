import { useEffect, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";

export default function RowActionsMenu({ actions = [], rowId, openActionRowId, setOpenActionRowId }) {
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const isOpen = openActionRowId === rowId;

  const toggleMenu = () => {
    if (isOpen) {
      setOpenActionRowId(null);
    } else {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right - 192 + window.scrollX, 
      });
      setOpenActionRowId(rowId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpenActionRowId(null);
      }
    };
  
    const handleEscape = (event) => {
      if (event.key === "Escape") setOpenActionRowId(null);
    };
  
    if (isOpen) {
      document.documentElement.classList.add("scroll-locked"); // 🔒 Bloquear scroll global
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    } else {
      document.documentElement.classList.remove("scroll-locked"); // 🔓 Restaurar scroll
    }
  
    return () => {
      document.documentElement.classList.remove("scroll-locked");
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, setOpenActionRowId]);
  
  

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="inline-flex items-center justify-center h-10 w-10 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          <Ellipsis className="w-4 h-4" />
          <span className="sr-only">Acciones</span>
        </button>
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-48 rounded-md bg-white shadow-md border"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
        >
          {actions.map(({ icon: Icon, label, onClick, danger }, index) => (
            <button
              key={index}
              onClick={() => {
                onClick();
                setOpenActionRowId(null);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100 ${danger ? "text-red-600" : ""}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
