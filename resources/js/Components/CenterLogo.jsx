import React from "react";
import { LayoutGrid } from "lucide-react";

export default function CenterLogo() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="rounded-full h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <div className="rounded-full h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-1">
              <LayoutGrid className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              P-D-i
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
