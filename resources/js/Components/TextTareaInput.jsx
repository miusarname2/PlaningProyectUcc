export default function TextTareaInput({
    name,
    id,
    value,
    onChange,
    placeholder = "",
    rows = 4,
    required = false,
    className = "",
    ...props
}) {
    const baseClasses =
        "block w-full border border-input rounded-md bg-white px-3 py-2.5 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 text-sm";

    return (
        <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={`${baseClasses} ${className}`}
            {...props}
        />
    );
}
