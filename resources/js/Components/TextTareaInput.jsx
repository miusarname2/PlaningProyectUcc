import React from "react";

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
        "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary/30 sm:text-sm";

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
