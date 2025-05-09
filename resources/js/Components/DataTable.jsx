import { useState } from "react";
import { filtered, permissionStrings } from "./SideBar";
import RowActionsMenu from "./RowActionsMenu";

export default function DataTable({
    columns = [],
    data = [],
    rowActions = () => [],
    permissionsValidate = false,
    module = "users",
}) {
    const permissions = JSON.parse(permissionStrings);
    const [openActionRowId, setOpenActionRowId] = useState(null);

    /**
     * Determine which actions the user is allowed to perform for this module.
     */
    const getAllowedActions = () => {
        const prefix = module + "_";
        const actionsSet = new Set();

        if (permissions[`${prefix}read`]) {
            actionsSet.add("view");
        }
        if (permissions[`${prefix}edit`]) {
            actionsSet.add("view");
            actionsSet.add("edit");
        }
        if (permissions[`${prefix}delete`]) {
            actionsSet.add("view");
            actionsSet.add("delete");
        }
        if (permissions[`${prefix}manage`]) {
            actionsSet.add("view");
            actionsSet.add("edit");
            actionsSet.add("delete");
        }

        return Array.from(actionsSet);
    };
    const allowedActions = getAllowedActions();
    return (
        <div className="border rounded-md">
            <div className="relative w-full overflow-x-auto max-h-[384px] overflow-y-auto">
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
                            data.map((row, rowIndex) => {
                                // Determine actions for this row
                                let actionsList = rowActions(row);
                                if (permissionsValidate) {
                                    actionsList = actionsList.filter((act) => {
                                        // Map label to permission key
                                        const label = act.label?.toLowerCase();
                                        let key;
                                        if (label === "eliminar") {
                                            key = "delete";
                                        } else if (label === "editar") {
                                            key = "edit";
                                        } else {
                                            key = "view"; // includes 'Ver' or others
                                        }
                                        return allowedActions.includes(key);
                                    });
                                }

                                return (
                                    <tr
                                        key={rowIndex}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        {columns.map((col, colIndex) => {
                                            const rawValue = row[col.key];
                                            const content =
                                                col.render && typeof col.render === "function"
                                                    ? col.render(rawValue, row)
                                                    : rawValue;

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
                                            {permissionsValidate &&
                                                actionsList.length === 1 &&
                                                actionsList[0].label.toLowerCase() === "ver" ? (
                                                <button
                                                    onClick={() => actionsList[0].onClick(row)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Ver
                                                </button>
                                            ) : (
                                                <RowActionsMenu
                                                    actions={actionsList}
                                                    rowId={row.id}
                                                    openActionRowId={openActionRowId}
                                                    setOpenActionRowId={setOpenActionRowId}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
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
