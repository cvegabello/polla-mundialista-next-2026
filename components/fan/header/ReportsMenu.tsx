import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { Trophy, Medal } from "lucide-react";

interface ReportsMenuProps {
  lang: Language;
}

export const ReportsMenu = ({ lang }: ReportsMenuProps) => {
  const t = DICTIONARY[lang];

  const btnBaseClass =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-700 bg-[#1a1b26] cursor-pointer relative group shadow-sm";

  return (
    <div className="flex justify-center relative z-20">
      <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-[#0f1016] border border-gray-700 shadow-xl">
        {/* 🏆 BOTÓN 1: POSICIONES */}
        <button
          className={`${btnBaseClass} text-gray-300 hover:text-white hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]`}
        >
          <Trophy
            size={16}
            className="text-yellow-400 group-hover:scale-110 transition-transform duration-300"
          />
          <span>{t.menuPositions}</span>
        </button>

        {/* 🥉 BOTÓN 2: 3ROS */}
        <button
          className={`${btnBaseClass} text-gray-300 hover:text-white hover:border-orange-400 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]`}
        >
          <Medal
            size={16}
            className="text-orange-400 group-hover:scale-110 transition-transform duration-300"
          />
          <span>{t.menuThirds}</span>
        </button>
      </div>
    </div>
  );
};
