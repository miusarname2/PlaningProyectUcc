import React from "react";

export default function CircleIcon({
    icon: Icon,
    bgColor,
    innerBgColor,
    iconColor,
    className,
    style,
}) {
    return (
        <div className={`absolute ${className} `} style={style}>
            <div className={`${bgColor} rounded-full p-2 sm:p-3`}>
                <div className={`${innerBgColor} rounded-full p-0.5 sm:p-1`}>
                    <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );
}
