"use client";

import React, { useState } from "react";

interface Team {
  id: string;
  name_es: string;
  name_en?: string;
  flag_code: string;
}

interface MatchData {
  id: number;
  match_date: string;
  stadium: string;
  city: string;
  home_score?: number | null | string;
  away_score?: number | null | string;
  home_team: Team;
  away_team: Team;
  home_team_id: string;
  away_team_id: string;
}

interface AdminMatchRowProps {
  match: MatchData;
  lang?: "es" | "en";
  onScoreChange: (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => void;
}

export const AdminMatchRow = ({
  match,
  lang = "es",
  onScoreChange,
}: AdminMatchRowProps) => {
  const getName = (team: Team | null) => {
    if (!team) return "Por definir";
    return lang === "en" ? team.name_en || team.name_es : team.name_es;
  };

  const getFlagUrl = (code3?: string) => {
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
    if (!code3 || code3.includes("_rep_")) return null;
    const code2 = map[code3.toLowerCase()] || code3.slice(0, 2).toLowerCase();
    return `https://flagcdn.com/w80/${code2}.png`;
  };

  const formatMatchInfo = (dateString: string) => {
    if (!dateString) return { date: "", time: "" };
    const date = new Date(dateString);
    const locale = lang === "en" ? "en-US" : "es-ES";
    return {
      dayStr: date.toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
      }),
      timeStr: date.toLocaleTimeString(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const { dayStr, timeStr } = formatMatchInfo(match.match_date);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "home" | "away",
  ) => {
    const val = e.target.value;
    if (val.length > 2) return;
    onScoreChange(match.id, type, val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const inputs = document.querySelectorAll('input[type="number"]');
      const index = Array.from(inputs).indexOf(e.currentTarget);
      if (index !== -1 && index < inputs.length - 1) {
        (inputs[index + 1] as HTMLInputElement).focus();
      }
    }
  };

  const TeamFlag = ({ code, name }: { code: string; name: string }) => {
    const [imgError, setImgError] = useState(false);
    const flagUrl = getFlagUrl(code);
    if (!flagUrl || imgError) {
      return <div className="w-full h-full bg-slate-700"></div>;
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
    <div className="flex flex-col bg-red-950/20 border border-red-500/20 rounded-lg mb-3 overflow-hidden shadow-sm hover:border-red-500/50 transition-all">
      <div className="flex justify-between items-center px-3 py-1.5 bg-black/60 border-b border-red-900/50 text-[10px] uppercase tracking-wider font-medium text-gray-400">
        <div className="flex items-center gap-2">
          <span className="text-red-400 font-bold">{dayStr}</span>
          <span>⏰ {timeStr}</span>
        </div>
        <div className="truncate max-w-[150px] text-right font-semibold">
          📍 {match.city}
        </div>
      </div>

      {/* 👇 AQUÍ ESTÁ LA TÁCTICA DE CSS GRID: 1fr - 120px - 1fr */}
      <div className="grid grid-cols-[1fr_120px_1fr] items-center p-2 relative min-h-[4.5rem]">
        {/* EQUIPO LOCAL (Columna Izquierda: Flexible pero con límite) */}
        <div className="flex items-center justify-end pr-2 overflow-hidden">
          <span className="text-xs md:text-sm font-bold text-gray-300 text-right leading-tight break-words line-clamp-2">
            {getName(match.home_team)}
          </span>
        </div>

        {/* MARCADORES (Centro Estricto: SIEMPRE 120px de ancho) */}
        <div className="flex items-end justify-center gap-2 w-[120px] mx-auto">
          {/* Bloque Local */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-5 rounded shadow-sm overflow-hidden border border-white/20 relative">
              <TeamFlag
                code={match.home_team?.flag_code}
                name={getName(match.home_team)}
              />
            </div>
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
              className="w-10 h-9 text-center text-lg font-black bg-red-100 text-red-950 border border-red-500 rounded focus:border-2 focus:border-red-700 focus:outline-none appearance-none transition-all"
            />
          </div>

          <span className="text-gray-500 font-bold text-sm mb-2">-</span>

          {/* Bloque Visitante */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-7 h-5 rounded shadow-sm overflow-hidden border border-white/20 relative bg-gray-800">
              <TeamFlag
                code={match.away_team?.flag_code}
                name={getName(match.away_team)}
              />
            </div>
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
              className="w-10 h-9 text-center text-lg font-black bg-red-100 text-red-950 border border-red-500 rounded focus:border-2 focus:border-red-700 focus:outline-none appearance-none transition-all"
            />
          </div>
        </div>

        {/* EQUIPO VISITANTE (Columna Derecha: Flexible pero con límite) */}
        <div className="flex items-center justify-start pl-2 overflow-hidden">
          <span className="text-xs md:text-sm font-bold text-gray-300 text-left leading-tight break-words line-clamp-2">
            {getName(match.away_team)}
          </span>
        </div>
      </div>
    </div>
  );
};
