"use client";
import React, { useState, useEffect, useRef } from "react";
import { AdminBracketMatchRow } from "./AdminBracketMatchRow";

export interface TeamProps {
  seed: string;
  name: string;
  name_es?: string | null;
  name_en?: string | null;
  flag?: string | null;
  group?: string | null;
  id?: string | null;
}

interface AdminBracketMatchCardProps {
  matchId: string | number;
  matchCode: string;
  homeTeam: TeamProps;
  awayTeam: TeamProps;
  style?: React.CSSProperties;
  lang?: "es" | "en";
  isFinal?: boolean;
  onAdvanceTeam?: (
    matchId: string | number,
    winner: TeamProps | null,
    isManual?: boolean,
  ) => void;
  // 👇 CAMBIO CLAVE: Usamos datos oficiales en vez de pronósticos
  officialMatch?: any;
  onSaveOfficial?: (
    matchId: string | number,
    hScore: number,
    aScore: number,
    winnerId: string,
  ) => void;
}

export const AdminBracketMatchCard = ({
  matchId,
  matchCode,
  homeTeam,
  awayTeam,
  style,
  lang = "es",
  isFinal = false,
  onAdvanceTeam,
  officialMatch,
  onSaveOfficial,
}: AdminBracketMatchCardProps) => {
  const getName = (team: TeamProps) => {
    if (lang === "en") return team.name_en || team.name_es || team.name;
    return team.name_es || team.name;
  };

  // Cargamos los scores oficiales en lugar de los pronosticados
  const [homeScore, setHomeScore] = useState(
    officialMatch?.home_score != null ? String(officialMatch.home_score) : "",
  );
  const [awayScore, setAwayScore] = useState(
    officialMatch?.away_score != null ? String(officialMatch.away_score) : "",
  );

  const initialWinner = officialMatch?.winner_id;
  const [homeWinner, setHomeWinner] = useState(
    !!initialWinner && initialWinner === homeTeam?.id,
  );
  const [awayWinner, setAwayWinner] = useState(
    !!initialWinner && initialWinner === awayTeam?.id,
  );

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteraction = useRef(false);

  const hScore = parseInt(homeScore);
  const aScore = parseInt(awayScore);
  const isComplete = !isNaN(hScore) && !isNaN(aScore);
  const isTie = isComplete && hScore === aScore;

  useEffect(() => {
    const winner = officialMatch?.winner_id;
    if (winner) {
      setHomeWinner(homeTeam?.id === winner);
      setAwayWinner(awayTeam?.id === winner);
    }
  }, [homeTeam?.id, awayTeam?.id, officialMatch?.winner_id]);

  useEffect(() => {
    if (!isComplete) {
      setHomeWinner(false);
      setAwayWinner(false);
      if (onAdvanceTeam)
        onAdvanceTeam(matchId, null, isUserInteraction.current);

      if (onSaveOfficial && isUserInteraction.current) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          const valH = homeScore === "" ? null : parseInt(homeScore);
          const valA = awayScore === "" ? null : parseInt(awayScore);
          onSaveOfficial(matchId, valH as any, valA as any, null as any);
          isUserInteraction.current = false;
        }, 1000);
      }
      return;
    }

    let currentHomeWinner = homeWinner;
    let currentAwayWinner = awayWinner;

    if (hScore > aScore) {
      setHomeWinner(true);
      setAwayWinner(false);
      currentHomeWinner = true;
      currentAwayWinner = false;
      if (onAdvanceTeam)
        onAdvanceTeam(matchId, homeTeam, isUserInteraction.current);
    } else if (aScore > hScore) {
      setHomeWinner(false);
      setAwayWinner(true);
      currentHomeWinner = false;
      currentAwayWinner = true;
      if (onAdvanceTeam)
        onAdvanceTeam(matchId, awayTeam, isUserInteraction.current);
    } else {
      if (homeWinner && onAdvanceTeam)
        onAdvanceTeam(matchId, homeTeam, isUserInteraction.current);
      else if (awayWinner && onAdvanceTeam)
        onAdvanceTeam(matchId, awayTeam, isUserInteraction.current);
      else if (onAdvanceTeam)
        onAdvanceTeam(matchId, null, isUserInteraction.current);
    }

    const hasWinner =
      hScore !== aScore || (isTie && (currentHomeWinner || currentAwayWinner));
    const winnerId = currentHomeWinner
      ? homeTeam?.id
      : currentAwayWinner
        ? awayTeam?.id
        : null;

    if (hasWinner && onSaveOfficial && isUserInteraction.current) {
      if (winnerId) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          onSaveOfficial(matchId, hScore, aScore, winnerId);
          isUserInteraction.current = false;
        }, 1000);
      }
    }
  }, [
    homeScore,
    awayScore,
    homeWinner,
    awayWinner,
    homeTeam?.id,
    awayTeam?.id,
  ]);

  const getDisplaySeed = (team: TeamProps) => {
    if (!team || !team.seed) return "";
    if (team.seed.startsWith("T_") && team.group) return `3${team.group}`;
    if (team.seed.startsWith("T_")) return "T_X";
    const standardSeedMatch = team.seed.match(/^([A-L])([1-2])$/);
    if (standardSeedMatch)
      return `${standardSeedMatch[2]}${standardSeedMatch[1]}`;
    return team.seed;
  };

  const handleUserHomeScore = (val: string) => {
    isUserInteraction.current = true;
    setHomeScore(val);
  };

  const handleUserAwayScore = (val: string) => {
    isUserInteraction.current = true;
    setAwayScore(val);
  };

  const handleUserHomeWin = () => {
    if (!isTie) return;
    isUserInteraction.current = true;
    setHomeWinner(true);
    setAwayWinner(false);
    if (onAdvanceTeam) onAdvanceTeam(matchId, homeTeam);
  };

  const handleUserAwayWin = () => {
    if (!isTie) return;
    isUserInteraction.current = true;
    setAwayWinner(true);
    setHomeWinner(false);
    if (onAdvanceTeam) onAdvanceTeam(matchId, awayTeam);
  };

  // 👇 ESTILOS DE SUPER ADMIN (Rojos oscuros y dorados para la final)
  const containerClasses = isFinal
    ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] scale-[1.05] z-10"
    : "border-red-900/80 shadow-2xl hover:border-red-500 hover:shadow-[0_0_25px_rgba(220,38,38,0.5)]";

  const accentLineClasses = isFinal
    ? "bg-gradient-to-b from-yellow-300 via-amber-500 to-orange-600"
    : "bg-gradient-to-b from-red-600 via-red-800 to-black";

  return (
    <div
      style={style}
      className={`shrink-0 group relative flex flex-col w-full bg-[#0a0a0e]/95 backdrop-blur-xl rounded-2xl border overflow-hidden transition-all duration-300 ${containerClasses}`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineClasses}`}
      />

      <div className="flex items-center px-3 py-0.5 bg-black border-b border-red-900/30">
        <div
          className={`px-1 py-0.1 rounded-md ${isFinal ? "bg-amber-500/20" : "bg-red-950/50"}`}
        >
          <span
            className={`text-[11px] font-bold tracking-[0.30em] ${
              isFinal
                ? "text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]"
                : "text-red-500"
            }`}
          >
            {isFinal ? `🏆 ${matchCode}` : matchCode}
          </span>
        </div>
      </div>

      <div className="flex flex-col px-2 py-1.5 gap-0">
        <AdminBracketMatchRow
          seed={getDisplaySeed(homeTeam) || "1A"}
          teamName={getName(homeTeam) || homeTeam.name}
          score={homeScore}
          isWinner={homeWinner}
          onScoreChange={handleUserHomeScore}
          onWinnerChange={handleUserHomeWin}
          isTie={isTie}
          seedColor={isFinal ? "text-amber-500" : "text-red-600"}
        />

        <div className="h-px w-full bg-red-900/30 my-0" />

        <AdminBracketMatchRow
          seed={getDisplaySeed(awayTeam) || "2B"}
          teamName={getName(awayTeam) || awayTeam.name}
          score={awayScore}
          isWinner={awayWinner}
          onScoreChange={handleUserAwayScore}
          onWinnerChange={handleUserAwayWin}
          isTie={isTie}
          seedColor={isFinal ? "text-amber-500" : "text-red-600"}
        />
      </div>
    </div>
  );
};
