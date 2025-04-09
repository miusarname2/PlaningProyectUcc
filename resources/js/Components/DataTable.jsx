import RowActionsMenu from "@/Components/RowActionsMenu";

export default function DataTable({
    columns = [],
    data = [],
    rowActions = () => [],
}) {
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

                                        if (
                                            col.render &&
                                            typeof col.render === "function"
                                        ) {
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

                                    <td className="p-4 align-middle">
                                        <RowActionsMenu
                                            actions={rowActions(row)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + 1}
                                    className="p-4 text-center text-muted-foreground"
                                >
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
