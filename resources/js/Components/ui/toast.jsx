import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'

// Provider to wrap your app
export function ToastProvider({ children }) {
    return (
        <ToastPrimitive.Provider swipeDirection="right">
            {children}
            <ToastViewport />
        </ToastPrimitive.Provider>
    )
}

// Container for all toasts
export function ToastViewport() {
    return (
        <ToastPrimitive.Viewport
            className="fixed bottom-0 right-0 flex flex-col p-4 gap-2 w-96 z-50 outline-none"
        />
    )
}

const VARIANT_CLASSES = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
}

// Individual toast
export const Toast = React.forwardRef(
    ({ variant = 'default', className = '', ...props }, ref) => (
        <ToastPrimitive.Root
            ref={ref}
            className={
                // Cambiamos auto_max-content por auto_1fr,
                // y añadimos whitespace-normal para permitir wrapping
                `${VARIANT_CLASSES[variant] || VARIANT_CLASSES.default}
         border border-gray-200 rounded-lg shadow-md p-4
         grid grid-cols-[auto_1fr] gap-4
         max-w-xs md:max-w-md
         whitespace-normal
         ${className}`
            }
            {...props}
        />
    )
)
Toast.displayName = ToastPrimitive.Root.displayName

// Title of the toast
export const ToastTitle = React.forwardRef(
    ({ className = '', ...props }, ref) => (
        <ToastPrimitive.Title
            ref={ref}
            className={`text-sm font-semibold ${className}`}
            {...props}
        />
    )
)
ToastTitle.displayName = ToastPrimitive.Title.displayName

// Description text
export const ToastDescription = React.forwardRef(
    ({ className = '', ...props }, ref) => (
        <ToastPrimitive.Description
            ref={ref}
            className={`
        text-sm text-gray-600 
        break-words     /* permite que palabras muy largas se partan */
        ${className}
      `}
            {...props}
        />
    )
)
ToastDescription.displayName = ToastPrimitive.Description.displayName

// Optional action button
export const ToastAction = React.forwardRef(
    ({ className = '', asChild = false, ...props }, ref) => (
        <ToastPrimitive.Action
            ref={ref}
            asChild={asChild}
            className={`
        inline-flex items-center px-3 py-1 text-sm font-medium
        bg-blue-500 text-white rounded
        ${className}
      `}
            {...props}
        />
    )
)
ToastAction.displayName = ToastPrimitive.Action.displayName

// Close button
export const ToastClose = React.forwardRef(
    ({ className = '', ...props }, ref) => (
        <ToastPrimitive.Close
            ref={ref}
            className={`
        absolute top-2 right-2 opacity-70 hover:opacity-100
        ${className}
      `}
            {...props}
        />
    )
)
ToastClose.displayName = ToastPrimitive.Close.displayName
