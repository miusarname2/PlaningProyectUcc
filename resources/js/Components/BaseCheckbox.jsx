import { forwardRef } from 'react';

export default forwardRef(function BaseCheckbox({ className = '', ...props }, ref) {
    return (
        <input
            {...props}
            type="checkbox"
            ref={ref}
            className={
                'peer h-4 w-4 shrink-0 rounded-sm border border-primary border-sky-600 focus:ring-2 focus:ring-ring focus:ring-offset-2 ' +
                className
            }
        />
    );
});
