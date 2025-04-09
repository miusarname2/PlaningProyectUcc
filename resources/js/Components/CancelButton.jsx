import { X } from 'lucide-react';

export default function CancelButton({ onClick, children = 'Cancel', type = 'button', className = '' }) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-sm font-medium ${className}`}
        >
            <X className="h-4 w-4 mr-2" />
            {children}
        </button>
    );
}
