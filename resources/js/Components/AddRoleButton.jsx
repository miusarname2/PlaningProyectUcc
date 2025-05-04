import { CirclePlus } from "lucide-react";

export default function AddRoleButton({ text, onClick, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`hover:bg-accent inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mt-4 border-dashed ${className}`}
        >
            <CirclePlus className="mr-2 h-4 w-4" />
            {text}
        </button>
    );
}