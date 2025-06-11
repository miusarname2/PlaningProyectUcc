import { CirclePlus, Download } from "lucide-react";
import ButtonGradient from "@/Components/ButtonGradient";
import { filtered,permissionStrings } from "./SideBar";
import { Button } from "@/Components/Button";
import { useRouteGuard } from "@/utils/generalFunctions";

export default function HeaderModule({
  title,
  description,
  buttonText,
  onClick,
  handleExport,
  showButton = true,
  verifyPermission = false,
  module = "users",
  exportExcel= false,
}) {
  const permissions = JSON.parse(permissionStrings);

  if (verifyPermission) {
    useRouteGuard(filtered);
  }

  const canShowButton = () => {
    if (!showButton) return false;
    if (!verifyPermission) return true;

    const prefix = module + "_";
    const hasCreate = permissions[`${prefix}create`];
    const hasManage = permissions[`${prefix}manage`];
    return Boolean(hasCreate || hasManage);
  };

  return (
    <div className="flex items-center justify-between mb-6 flex-wrap gap-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>

      {canShowButton() && (
        <div className="flex gap-4">
            <ButtonGradient onClick={onClick}>
          <CirclePlus className="w-4 h-4 mr-2" />
          {buttonText}
        </ButtonGradient>
        {exportExcel && (
            <Button
              variant="ghost"
              className="flex items-center gap-1 text-xs md:text-sm"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

