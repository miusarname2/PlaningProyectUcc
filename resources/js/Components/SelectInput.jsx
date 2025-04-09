import { forwardRef } from 'react';

export default forwardRef(function SelectInput({ options = [], className = '', ...props }, ref) {
    return (
        <select
            {...props}
            ref={ref}
            className={`block w-full border border-input rounded-md bg-white px-3 py-2.5 text-sm text-black focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 ${className}`}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
    );
});

