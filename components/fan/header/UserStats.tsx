// src/components/fan/header/UserStats.tsx

import React from "react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";

interface UserStatsProps {
  username: string;
  pollaName?: string;
  points: number;
  submissionDate: string | null;
  lang: Language;
}

export const UserStats = ({
  username,
  pollaName,
  points,
  submissionDate,
  lang,
}: UserStatsProps) => {
  const t = DICTIONARY[lang];
  const isOfficial = !!submissionDate;

  return (
    // CAMBIO: border-orange-300 (Naranja clarito para el día)
    // Mantenemos dark:border-gray-700 (Gris sutil para la noche)
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-3 px-6 py-3 rounded-full bg-[#0f1016] border border-orange-300 dark:border-gray-700 shadow-2xl relative z-20 transition-all duration-300">
      {/* IZQUIERDA: NOMBRE */}
      <div className="flex flex-col">
        <span className="text-cyan-400 text-lg md:text-xl font-bold tracking-wider uppercase drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
          {username}
        </span>
        {pollaName && (
          <span className="flex items-center gap-1 text-xs font-semibold tracking-wide mt-0.5">
            <span className="text-orange-400">🏆</span>
            <span
              className="text-orange-400 uppercase tracking-wider truncate max-w-[160px]"
              style={{ textShadow: "0 0 12px rgba(251,146,60,0.5)" }}
            >
              {pollaName}
            </span>
          </span>
        )}
      </div>

      {/* CENTRO: SEMÁFORO */}
      <div
        className={`px-6 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all ${
          isOfficial
            ? "bg-green-900/30 border-green-600 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]"
            : "bg-yellow-600/20 border-yellow-600 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]"
        }`}
      >
        {isOfficial ? t.statusOfficial : t.statusDraft}
      </div>

      {/* DERECHA: PUNTOS */}
      <div className="flex flex-col items-end">
        <span className="text-gray-300 text-[10px] uppercase tracking-wider font-semibold opacity-80">
          {t.points}
        </span>
        <span className="text-white font-bold text-2xl leading-none drop-shadow-md">
          {points}
        </span>
      </div>
    </div>
  );
};
