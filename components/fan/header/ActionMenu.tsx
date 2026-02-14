import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { LogOut, Trophy, Medal } from "lucide-react";

interface ActionMenuProps {
  lang: Language;
  onLogout: () => void;
}

export const ActionMenu = ({ lang, onLogout }: ActionMenuProps) => {
  const t = DICTIONARY[lang];

  // CAMBIO: border-gray-700 (Más visible, igual al panel de stats)
  const btnBaseClass =
    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border border-gray-700 bg-[#1a1b26] cursor-pointer relative group shadow-sm";

  return (
    <div className="flex justify-center mb-4 relative z-20">
      {/* CONTENEDOR GENERAL */}
      <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 rounded-2xl bg-[#0f1016] border border-gray-700 shadow-2xl">
        {/* 🏆 BOTÓN 1: POSICIONES */}
        <button
          className={`${btnBaseClass} text-gray-300 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]`}
        >
          <Trophy
            size={16}
            className="text-yellow-400 group-hover:scale-110 transition-transform duration-300"
          />
          <span>{t.menuPositions}</span>
        </button>

        {/* 🥉 BOTÓN 2: 3ROS */}
        <button
          className={`${btnBaseClass} text-gray-300 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]`}
        >
          <Medal
            size={16}
            className="text-orange-400 group-hover:scale-110 transition-transform duration-300"
          />
          <span>{t.menuThirds}</span>
        </button>

        {/* 🚪 BOTÓN 3: SALIR */}
        <button
          onClick={onLogout}
          className={`${btnBaseClass} text-red-400 hover:text-red-300 hover:border-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] hover:bg-red-500/10`}
        >
          <LogOut
            size={16}
            className="text-red-500 group-hover:rotate-12 transition-transform duration-300"
          />
          <span>{t.menuExit}</span>
        </button>
      </div>
    </div>
  );
};
