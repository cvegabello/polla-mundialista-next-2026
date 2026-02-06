"use client";

import React, { useState } from "react";

// 1. ACTUALIZAR INTERFAZ: Agregamos name_en opcional
interface Team {
  name_es: string;
  name_en?: string;
  flag_code: string;
}

interface MatchData {
  id: number;
  match_date: string;
  stadium: string;
  city: string;
  home_score?: number | null;
  away_score?: number | null;
  home_team: Team;
  away_team: Team;
}

interface MatchRowProps {
  match: MatchData;
  editable?: boolean;
  lang?: "es" | "en";
  onScoreChange?: (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => void;
}

export const MatchRow = ({
  match,
  editable = false,
  lang = "es",
  onScoreChange,
}: MatchRowProps) => {
  // --- HELPER PARA OBTENER NOMBRE SEGÚN IDIOMA ---
  const getName = (team: Team) => {
    if (lang === "en") {
      return team.name_en || team.name_es;
    }
    return team.name_es;
  };

  const getFlagUrl = (code3: string) => {
    const map: Record<string, string> = {
      col: "co",
      mex: "mx",
      usa: "us",
      bra: "br",
      arg: "ar",
      por: "pt",
      esp: "es",
      fra: "fr",
      ger: "de",
      eng: "gb",
      uru: "uy",
      ecu: "ec",
      can: "ca",
      kor: "kr",
      jpn: "jp",
      sen: "sn",
      ned: "nl",
      bel: "be",
      cro: "hr",
      mar: "ma",
      sui: "ch",
      crc: "cr",
      irn: "ir",
      ksa: "sa",
      aus: "au",
      tun: "tn",
      pol: "pl",
      cmr: "cm",
      gha: "gh",
      hai: "ht",
      civ: "ci",
      alg: "dz",
      egy: "eg",
      qat: "qa",
      par: "py",
      nzl: "nz",
      cpv: "cv",
      nor: "no",
      aut: "at",
      jor: "jo",
      uzb: "uz",
      pan: "pa",
    };
    if (code3.includes("_rep_")) return null;
    const code2 = map[code3.toLowerCase()] || code3.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w80/${code2}.png`;
  };

  const formatMatchInfo = (dateString: string) => {
    if (!dateString) return { date: "", time: "" };
    const date = new Date(dateString);
    // Usamos el locale dinámico
    const locale = lang === "en" ? "en-US" : "es-ES";

    const dayStr = date.toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    });
    const timeStr = date.toLocaleTimeString(locale, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return { dayStr, timeStr };
  };

  const { dayStr, timeStr } = formatMatchInfo(match.match_date);

  // --- CONTROL DE INPUT ---
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "home" | "away",
  ) => {
    const val = e.target.value;
    if (val.length > 2) return;
    if (onScoreChange) {
      onScoreChange(match.id, type, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || (e.key === "Tab" && !e.shiftKey)) {
      e.preventDefault();
      const allInputs = Array.from(
        document.querySelectorAll('input[type="number"]'),
      );
      const currentIndex = allInputs.indexOf(e.currentTarget);
      if (currentIndex !== -1 && currentIndex < allInputs.length - 1) {
        const nextInput = allInputs[currentIndex + 1] as HTMLInputElement;
        nextInput.focus();
        nextInput.select();
      } else {
        e.currentTarget.blur();
      }
    }
  };

  const TeamFlag = ({ code, name }: { code: string; name: string }) => {
    const [imgError, setImgError] = useState(false);
    const flagUrl = getFlagUrl(code);

    if (!flagUrl || imgError) {
      return (
        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 text-slate-400"
          >
            <path
              fillRule="evenodd"
              d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.352-.199-2.668-.563-3.913a.75.75 0 00-.722-.515 11.209 11.209 0 01-7.877-3.08zM12 4.28a11.235 11.235 0 00-1.688-1.01 12.708 12.708 0 006.376 2.502c.319 1.15.503 2.36.536 3.603.02.73-.053 1.455-.213 2.158a12.71 12.71 0 01-1.082 2.768c-.628 1.157-1.45 2.195-2.408 3.05a11.218 11.218 0 01-1.521-6.073z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
    return (
      <img
        src={flagUrl}
        alt={name}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    );
  };

  return (
    <div className="flex flex-col bg-white/5 dark:bg-slate-100 border border-white/10 dark:border-slate-200 rounded-lg mb-3 overflow-hidden shadow-sm hover:border-white/20 transition-all">
      <div className="flex justify-between items-center px-3 py-1.5 bg-black/40 dark:bg-slate-300 border-b border-white/5 dark:border-slate-300/50 text-[10px] uppercase tracking-wider font-medium text-gray-400 dark:text-slate-600">
        <div className="flex items-center gap-2">
          <span
            className="text-cyan-400 dark:text-blue-700 font-bold"
            suppressHydrationWarning
          >
            {dayStr}
          </span>
          <span suppressHydrationWarning>⏰ {timeStr}</span>
        </div>
        <div className="truncate max-w-[150px] text-right font-semibold">
          📍 {match.city}
        </div>
      </div>

      <div className="flex items-center justify-between p-2 relative h-16">
        {/* NOMBRE LOCAL (CORREGIDO) */}
        <div className="flex-1 flex items-center justify-end pr-3">
          <span className="text-sm font-medium text-gray-300 dark:text-slate-700 text-right leading-tight block break-words">
            {getName(match.home_team)}
          </span>
        </div>

        <div className="flex items-end justify-center gap-2">
          {/* BANDERA LOCAL */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-4 rounded shadow-sm overflow-hidden border border-white/20 dark:border-slate-300 relative bg-gray-800">
              <TeamFlag
                code={match.home_team.flag_code}
                name={getName(match.home_team)}
              />
            </div>
            {editable ? (
              <input
                type="number"
                placeholder="-"
                value={
                  match.home_score === null || match.home_score === undefined
                    ? ""
                    : match.home_score
                }
                onChange={(e) => handleInputChange(e, "home")}
                onKeyDown={handleKeyDown}
                enterKeyHint="next"
                className="w-10 h-8 text-center text-lg font-bold bg-blue-200 text-slate-900 border border-cyan-400 rounded focus:border-2 focus:border-cyan-600 focus:outline-none focus:ring-0 appearance-none transition-all"
              />
            ) : (
              <div className="w-10 h-8 flex items-center justify-center bg-black/40 dark:bg-slate-300 rounded border border-white/10 dark:border-slate-400 font-mono font-bold text-white dark:text-slate-800 text-sm">
                {match.home_score ?? "-"}
              </div>
            )}
          </div>

          <span className="text-gray-500 dark:text-slate-400 font-bold text-xs mb-2">
            -
          </span>

          {/* VISITANTE */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-6 h-4 rounded shadow-sm overflow-hidden border border-white/20 dark:border-slate-300 relative bg-gray-800">
              <TeamFlag
                code={match.away_team.flag_code}
                name={getName(match.away_team)}
              />
            </div>
            {editable ? (
              <input
                type="number"
                placeholder="-"
                value={
                  match.away_score === null || match.away_score === undefined
                    ? ""
                    : match.away_score
                }
                onChange={(e) => handleInputChange(e, "away")}
                onKeyDown={handleKeyDown}
                enterKeyHint="next"
                className="w-10 h-8 text-center text-lg font-bold bg-blue-200 text-slate-900 border border-cyan-400 rounded focus:border-2 focus:border-cyan-600 focus:outline-none focus:ring-0 appearance-none transition-all"
              />
            ) : (
              <div className="w-10 h-8 flex items-center justify-center bg-black/40 dark:bg-slate-300 rounded border border-white/10 dark:border-slate-400 font-mono font-bold text-white dark:text-slate-800 text-sm">
                {match.away_score ?? "-"}
              </div>
            )}
          </div>
        </div>

        {/* NOMBRE VISITANTE (CORREGIDO) */}
        <div className="flex-1 flex items-center justify-start pl-3">
          <span className="text-sm font-medium text-gray-300 dark:text-slate-700 text-left leading-tight block break-words">
            {getName(match.away_team)}
          </span>
        </div>
      </div>
    </div>
  );
};
