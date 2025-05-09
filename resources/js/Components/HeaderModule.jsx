import { CirclePlus } from "lucide-react";
import ButtonGradient from "@/Components/ButtonGradient";
import { filtered,permissionStrings } from "./SideBar";
import { useEffect } from "react";
import { useRouteGuard } from "@/utils/generalFunctions";


export default function HeaderModule({
  title,
  description,
  buttonText,
  onClick,
  showButton = true,
  verifyPermission = false,
  module = "users",
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
        <ButtonGradient onClick={onClick}>
          <CirclePlus className="w-4 h-4 mr-2" />
          {buttonText}
        </ButtonGradient>
      )}
    </div>
  );
}

