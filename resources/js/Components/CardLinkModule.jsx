import React from 'react';
import { router } from '@inertiajs/react';

export default function CardLinkModule({
    icon: Icon,
    to = "",
    bgCircle = "bg-blue-100",
    iconColor = "text-blue-600",
    title,
    description
}) {
    const handleClick = () => router.visit(to);
    return (
        <div className="rounded-lg border bg-white text-card-foreground shadow-sm overflow-hidden hover:shadow-md transition-shadow border-gray-200 hover:border-blue-200">
            <button onClick={handleClick} className="h-full flex flex-col w-full">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 "></div>
                <div className="p-6">
                    <div className="flex justify-center mb-6">
                        <div className={`w-24 h-24 ${bgCircle} rounded-full flex items-center justify-center`}>
                            {Icon && <Icon className={`h-12 w-12 ${iconColor}`} />}
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600 text-center text-sm">{description}</p>
                </div>
            </button>
        </div>
    );
}
