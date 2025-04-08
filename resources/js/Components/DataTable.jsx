import { Ellipsis } from "lucide-react";

export default function DataTable({ columns = [], data = [] }) {
    return (
        <div className="border rounded-md">
            <div className="relative w-full overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50">
                            {columns.map((col, i) => (
                                <th
                                    key={i}
                                    className="h-12 px-4 text-left align-middle font-medium text-muted-foreground"
                                >
                                    {col.title}
                                </th>
                            ))}
                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[80px]">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {Array.isArray(data) && data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr
                                    key={rowIndex}
                                    className="border-b transition-colors hover:bg-muted/50"
                                >
                                    {columns.map((col, colIndex) => {
                                        const rawValue = row[col.key];
                                        let content = rawValue;

                                        // Si hay un render personalizado, lo usamos
                                        if (col.render && typeof col.render === "function") {
                                            content = col.render(rawValue, row);
                                        }

                                        return (
                                            <td
                                                key={colIndex}
                                                className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                                            >
                                                {content}
                                            </td>
                                        );
                                    })}

                                    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                                        <button
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                                            type="button"
                                        >
                                            <Ellipsis className="w-4 h-4" />
                                            <span className="sr-only">Acciones</span>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-4 text-center text-muted-foreground">
                                    No hay datos para mostrar
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
