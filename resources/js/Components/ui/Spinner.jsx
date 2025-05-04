import { LayoutGrid } from "lucide-react";

export default function Spinner() {
  return (
    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center animate-spin">
      <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    </div>
  );
}