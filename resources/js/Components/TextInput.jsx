import { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function TextInput({ type = 'text', className = '', isFocused = false, ...props }, ref) {
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    return (
        <input
            {...props}
            type={type}
            className={
                'block w-full border border-input rounded-md bg-white px-3 py-2.5 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-neutral-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 text-sm ' +
                className
            }
            ref={input}
        />
    );
});
