export default function RoleButton({ title, description, onClick, active = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border w-full justify-start text-left h-auto py-3 px-4 ${
                active
                    ? "border-blue-500 bg-blue-50"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
            }`}
        >
            <div>
                <div className="font-medium">{title}</div>
                <div className="text-xs text-gray-500 mt-1 text-wrap">{description}</div>
            </div>
        </button>
    );
}
