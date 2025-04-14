export default function LinkConIcono({ url, icon: Icon, children = "Entrar al Sitio" }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border bg-background h-9 rounded-md px-3 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
            {Icon && <Icon className="mr-1 h-3 w-3" />}
            {children}
        </a>
    )
}
