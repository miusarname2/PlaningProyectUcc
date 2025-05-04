import React from 'react';
import { router } from '@inertiajs/react';

export default function OptionSideBar({ icon: Icon, text, to, className = '', ...props }) {
    const handleClick = () => router.visit(to);

    return (
        <li>
            <button
                onClick={handleClick}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full ${className}`}
                {...props}
            >
                {Icon && <Icon className="w-5 h-5 " />}
                <span className=" font-medium text-sm text-start">{text}</span>
            </button>
        </li>
    );
}
