"use client";
import React, { useState, useEffect } from "react";
import { BracketMatchRow } from "@/components/bracket/BracketMatchRow";

export interface TeamProps {
  seed: string;
  name: string;
  name_es?: string | null;
  name_en?: string | null;
  flag?: string | null;
  group?: string | null;
  id?: string | null;
}

interface BracketMatchCardProps {
  matchId: string | number;
  matchCode: string;
  homeTeam: TeamProps;
  awayTeam: TeamProps;
  style?: React.CSSProperties;
  lang?: "es" | "en";
  isFinal?: boolean;
  onAdvanceTeam?: (matchId: string | number, winner: TeamProps | null) => void;
}

export const BracketMatchCard = ({
  matchId,
  matchCode,
  homeTeam,
  awayTeam,
  style,
  lang = "es",
  isFinal = false,
  onAdvanceTeam,
}: BracketMatchCardProps) => {
  const getName = (team: TeamProps) => {
    if (lang === "en") return team.name_en || team.name_es || team.name;
    return team.name_es || team.name;
  };
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [homeWinner, setHomeWinner] = useState(false);
  const [awayWinner, setAwayWinner] = useState(false);

  const hScore = parseInt(homeScore);
  const aScore = parseInt(awayScore);
  const isComplete = !isNaN(hScore) && !isNaN(aScore);
  const isTie = isComplete && hScore === aScore;

  useEffect(() => {
    if (!isComplete) {
      setHomeWinner(false);
      setAwayWinner(false);
      if (onAdvanceTeam) onAdvanceTeam(matchId, null);
      return;
    }

    if (hScore > aScore) {
      setHomeWinner(true);
      setAwayWinner(false);
      if (onAdvanceTeam) onAdvanceTeam(matchId, homeTeam);
    } else if (aScore > hScore) {
      setHomeWinner(false);
      setAwayWinner(true);
      if (onAdvanceTeam) onAdvanceTeam(matchId, awayTeam);
    } else {
      setHomeWinner(false);
      setAwayWinner(false);
      if (onAdvanceTeam) onAdvanceTeam(matchId, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeScore, awayScore]);

  const getDisplaySeed = (team: TeamProps) => {
    if (!team || !team.seed) return "";
    if (team.seed.startsWith("T_") && team.group) return `3${team.group}`;
    const standardSeedMatch = team.seed.match(/^([A-L])([1-2])$/);
    if (standardSeedMatch)
      return `${standardSeedMatch[2]}${standardSeedMatch[1]}`;
    return team.seed;
  };

  const handleHomeWin = () => {
    if (!isTie) return;
    setHomeWinner(true);
    setAwayWinner(false);
    if (onAdvanceTeam) onAdvanceTeam(matchId, homeTeam);
  };

  const handleAwayWin = () => {
    if (!isTie) return;
    setAwayWinner(true);
    setHomeWinner(false);
    if (onAdvanceTeam) onAdvanceTeam(matchId, awayTeam);
  };

  // 🪄 ESTILOS CONDICIONALES: Definimos cómo se ve una tarjeta normal vs la de la Final
  const containerClasses = isFinal
    ? "border-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.6)] hover:border-amber-300 hover:shadow-[0_0_55px_rgba(251,191,36,0.9)] scale-[1.05] z-10" // 🏆 Dorado neón sobrio y un poquitico más grande
    : "border-white/80 shadow-2xl hover:border-orange-500/80 hover:shadow-[0_0_25px_rgba(249,115,22,0.80)]"; // ⚽ Normal

  const accentLineClasses = isFinal
    ? "bg-gradient-to-b from-amber-200 via-yellow-500 to-orange-500" // 🏆 Línea dorada
    : "bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500"; // ⚽ Línea colorida normal

  return (
    <div
      style={style}
      className={`shrink-0 group relative flex flex-col w-full bg-black/90 backdrop-blur-lg rounded-2xl border overflow-hidden transition-all duration-300 ${containerClasses}`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineClasses}`}
      />

      <div className="flex items-center px-4 py-2 bg-gray-600/20 border-b border-white/20">
        <div
          className={`px-3 py-0.5 rounded-md ${isFinal ? "bg-amber-500/20" : "bg-gray-400"}`}
        >
          <span
            className={`text-[12px] font-bold tracking-[0.20em] ${isFinal ? "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]" : "text-fuchsia-800"}`}
          >
            {isFinal ? `🏆 ${matchCode}` : matchCode}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-3 gap-0.5">
        <BracketMatchRow
          seed={getDisplaySeed(homeTeam) || "1A"}
          teamName={getName(homeTeam) || homeTeam.name}
          score={homeScore}
          isWinner={homeWinner}
          onScoreChange={setHomeScore}
          onWinnerChange={handleHomeWin}
          isTie={isTie}
        />

        <div className="h-px w-full bg-white/10 my-1" />

        <BracketMatchRow
          seed={getDisplaySeed(awayTeam) || "2B"}
          teamName={getName(awayTeam) || awayTeam.name}
          score={awayScore}
          isWinner={awayWinner}
          onScoreChange={setAwayScore}
          onWinnerChange={handleAwayWin}
          isTie={isTie}
        />
      </div>
    </div>
  );
};
