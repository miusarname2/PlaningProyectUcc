import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from '@/components/ui/toast'
import { useToast } from '@/lib/toast-context'

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map((t) => (
                <Toast
                    key={t.id}
                    open={t.open}
                    onOpenChange={t.onOpenChange}
                    variant={t.variant}
                >
                    {t.title && <ToastTitle>{t.title}</ToastTitle>}
                    {t.description && <ToastDescription>{t.description}</ToastDescription>}
                    {t.action && (
                        <ToastAction asChild>
                            {t.action}
                        </ToastAction>
                    )}
                    <ToastClose />
                </Toast>
            ))}
            <ToastViewport />
        </ToastProvider>
    )
}
