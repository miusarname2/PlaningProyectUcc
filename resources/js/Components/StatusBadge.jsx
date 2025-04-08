export default function StatusBadge({ status }) {
    const isActive = status === "Activo";
  
    const baseStyles =
      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
  
    const statusStyles = isActive
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  
    return <div className={`${baseStyles} ${statusStyles}`}>{status}</div>;
  }
  