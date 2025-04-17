const allowedColors = [
    "gray",
    "blue",
    "red",
    "yellow",
    "green",
    "purple",
    "indigo",
    "orange",
    "amber",
    "lime",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "violet",
    "fuchsia",
    "pink",
    "rose",
    "slate",
    "stone",
    "neutral",
    "zinc"
];

export function Badge({ label, color = "gray" }) {
    const safeColor = allowedColors.includes(color) ? color : "gray";

    const baseStyles =
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";

    // Generamos dinámicamente las clases de Tailwind
    const colorStyles = `bg-${safeColor}-100 text-${safeColor}-800`;

    return <div className={`${baseStyles} ${colorStyles}`}>{label}</div>;
}