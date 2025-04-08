import React from "react";
import { LayoutGrid } from "lucide-react";

export default function ApplicationLogo({
  textSize = "text-2xl",
  textColor = "text-gray-800",
}) {
  return (
    <div className="text-center md:text-left w-full max-w-md justify-center md:justify-start flex items-center">
      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mr-2 sm:mr-3">
        <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <h2
        className={`${textSize} font-bold ${textColor}`}
      >
        PlanningProject
      </h2>
    </div>
  );
}
