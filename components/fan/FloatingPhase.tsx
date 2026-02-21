import React from "react";
import { Trophy } from "lucide-react";

interface FloatingPhaseProps {
  isVisible: boolean;
  title: string;
}

export const FloatingPhase = ({ isVisible, title }: FloatingPhaseProps) => {
  return (
    <div
      // 🪄 CAMBIO: bottom-2 la pega más abajo. z-40 para que no estorbe con modales.
      className={`sticky bottom-2 z-40 flex justify-center w-full pointer-events-none transition-all duration-500 ease-out ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
    >
      <div className="bg-black/90 backdrop-blur-xl border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.3)] rounded-full px-6 py-2.5 flex items-center space-x-3 pointer-events-auto">
        <Trophy
          className="text-amber-500 drop-shadow-[0_0_5px_rgba(245,158,11,0.8)]"
          size={18}
        />
        <span className="text-white font-bold tracking-widest uppercase text-xs sm:text-sm whitespace-nowrap">
          {title}
        </span>
      </div>
    </div>
  );
};
