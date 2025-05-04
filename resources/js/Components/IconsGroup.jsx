import React from "react";
import CircleIcon from "@/Components/CircleIcon";
import CenterLogo from "@/Components/CenterLogo";
import {
  Users,
  BookOpen,
  Shield,
  Search,
  Calendar,
  ClipboardList
} from "lucide-react";

export default function IconsGroup() {
  const items = [
    {
      icon: Shield,
      bg: "bg-yellow-100",
      innerBg: "bg-yellow-50",
      color: "text-yellow-500",
      pos: "top-0 left-1/2",
      translate: "-translate-x-1/2 -translate-y-1/2"
    },
    {
      icon: Users,
      bg: "bg-blue-100",
      innerBg: "bg-blue-50",
      color: "text-blue-500",
      pos: "top-1/4 right-0",
      translate: "translate-x-1/2"
    },
    {
      icon: BookOpen,
      bg: "bg-indigo-100",
      innerBg: "bg-indigo-50",
      color: "text-indigo-500",
      pos: "bottom-1/4 right-0",
      translate: "translate-x-1/2"
    },
    {
      icon: Calendar,
      bg: "bg-purple-100",
      innerBg: "bg-purple-50",
      color: "text-purple-500",
      pos: "bottom-0 left-1/2",
      translate: "-translate-x-1/2 translate-y-1/2"
    },
    {
      icon: ClipboardList,
      bg: "bg-green-100",
      innerBg: "bg-green-50",
      color: "text-green-500",
      pos: "bottom-1/4 left-0",
      translate: "-translate-x-1/2"
    },
    {
      icon: Search,
      bg: "bg-red-100",
      innerBg: "bg-red-50",
      color: "text-red-500",
      pos: "top-1/4 left-0",
      translate: "-translate-x-1/2"
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="relative w-48 sm:w-72 md:w-80 aspect-square">
        {items.map((item, idx) => (
          <CircleIcon
            key={idx}
            icon={item.icon}
            bgColor={item.bg}
            innerBgColor={item.innerBg}
            iconColor={item.color}
            className={`${item.pos} ${item.translate}`}
            aria-hidden="true"
          />
        ))}
        <CenterLogo />
      </div>
      <h5 className="mt-8 sm:mt-12 md:mt-16 text-center text-blue-200 font-bold text-[clamp(1.8rem,5vw,3rem)]">
        BIENVENIDOS
      </h5>
    </div>
  );
}
