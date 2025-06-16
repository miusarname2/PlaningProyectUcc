import { forwardRef, useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
export default forwardRef(function SearchableSelect(
    {
        options = [],
        placeholder = '-- Todos los Asesores --',
        className = '',
        value: valueProp,
        onChange,
        name,
        ...props
    },
    ref
) {
    // Estado interno para el valor seleccionado
    const [value, setValue] = useState(valueProp || '');
    // Estado para controlar dropdown, filtro y opción resaltada
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const [highlighted, setHighlighted] = useState(0);
    const containerRef = useRef(null);

    // Sincroniza valor interno si cambia el prop desde el padre
    useEffect(() => {
        setValue(valueProp || '');
    }, [valueProp]);

    // Cierra dropdown al click fuera
    useEffect(() => {
        const onClickOutside = (e) => {
            if (!containerRef.current.contains(e.target)) {
                setOpen(false);
                setFilter('');
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    // Opciones filtradas
    const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(filter.toLowerCase())
    );

    // Etiqueta a mostrar en el botón
    const currentLabel =
        options.find((opt) => opt.value === value)?.label || placeholder;

    // Cuando se selecciona una opción
    const selectValue = (newValue) => {
        setValue(newValue);
        if (onChange) {
            onChange({
                target: {
                    name,
                    value: newValue
                }
            });
        }
        setOpen(false);
        setFilter('');
    };

    // Teclado: flechas, enter, escape
    const onKeyDown = (e) => {
        if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
            e.preventDefault();
            setOpen(true);
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlighted((h) => Math.max(h - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (filtered[highlighted]) selectValue(filtered[highlighted].value);
                break;
            case 'Escape':
                setOpen(false);
                setFilter('');
                break;
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${className}`}
            onKeyDown={onKeyDown}
            {...props}
        >
            {/* Hidden input para formularios */}
            {name && <input type="hidden" name={name} value={value} />}

            {/* Botón principal */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center justify-between w-full border border-input rounded-md bg-white px-3 py-2.5 text-sm text-black focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600"
            >
                <span>{currentLabel}</span>
                <ChevronDown className="h-5 w-5 text-gray-400" />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-input rounded-md shadow-lg">
                    {/* Input de búsqueda */}
                    <input
                        type="text"
                        autoFocus
                        value={filter}
                        onChange={(e) => {
                            setFilter(e.target.value);
                            setHighlighted(0);
                        }}
                        className="block w-full px-3 py-2.5 text-sm border-b border-input focus:outline-none"
                        placeholder="Buscar…"
                    />

                    {/* Lista de opciones */}
                    <ul className="max-h-60 overflow-auto">
                        {filtered.length > 0 ? (
                            filtered.map((opt, i) => (
                                <li
                                    key={opt.value}
                                    onMouseEnter={() => setHighlighted(i)}
                                    onClick={() => selectValue(opt.value)}
                                    className={`
                    cursor-pointer px-3 py-2 text-sm
                    ${i === highlighted
                                            ? 'bg-indigo-100 text-black'
                                            : 'text-gray-800'
                                        }
                  `}
                                >
                                    {opt.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-3 py-2 text-sm text-gray-500 italic">
                                No hay resultados
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
});
