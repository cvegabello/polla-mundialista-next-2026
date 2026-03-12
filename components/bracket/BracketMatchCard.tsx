"use client";
import React, { useState, useEffect, useRef } from "react";
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
  isLocked?: boolean;
  style?: React.CSSProperties;
  lang?: "es" | "en";
  isFinal?: boolean;
  onAdvanceTeam?: (
    matchId: string | number,
    winner: TeamProps | null,
    isManual?: boolean,
  ) => void;
  prediction?: any;
  onSavePrediction?: (
    matchId: string | number,
    hScore: number,
    aScore: number,
    winnerId: string,
  ) => void;
  pointsWon?: number | null;
  pointsCondition?: string | null;
  officialScore?: { home: number; away: number };
}

export const BracketMatchCard = ({
  matchId,
  matchCode,
  homeTeam,
  awayTeam,
  isLocked,
  style,
  lang = "es",
  isFinal = false,
  onAdvanceTeam,
  prediction,
  onSavePrediction,
  pointsWon,
  pointsCondition,
  officialScore,
}: BracketMatchCardProps) => {
  const getName = (team: TeamProps) => {
    if (lang === "en") return team.name_en || team.name_es || team.name;
    return team.name_es || team.name;
  };

  const [homeScore, setHomeScore] = useState(
    prediction?.pred_home != null ? String(prediction.pred_home) : "",
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.pred_away != null ? String(prediction.pred_away) : "",
  );

  const initialWinner = prediction?.predicted_winner;
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
    const winner = prediction?.predicted_winner;
    if (winner) {
      setHomeWinner(homeTeam?.id === winner);
      setAwayWinner(awayTeam?.id === winner);
    }
  }, [homeTeam?.id, awayTeam?.id, prediction?.predicted_winner]);

  useEffect(() => {
    if (!isComplete) {
      setHomeWinner(false);
      setAwayWinner(false);
      if (onAdvanceTeam)
        onAdvanceTeam(matchId, null, isUserInteraction.current);
      if (onSavePrediction && isUserInteraction.current) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          const valH = homeScore === "" ? null : parseInt(homeScore);
          const valA = awayScore === "" ? null : parseInt(awayScore);
          onSavePrediction(matchId, valH as any, valA as any, "" as any);
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

    if (hasWinner && onSavePrediction && isUserInteraction.current) {
      if (winnerId) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
          onSavePrediction(matchId, hScore, aScore, winnerId);
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

  const containerClasses = isFinal
    ? "border-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.6)] hover:border-amber-300 hover:shadow-[0_0_55px_rgba(251,191,36,0.9)] scale-[1.05] z-10"
    : "border-white/80 shadow-2xl hover:border-orange-500/80 hover:shadow-[0_0_25px_rgba(249,115,22,0.80)]";

  const accentLineClasses = isFinal
    ? "bg-gradient-to-b from-amber-200 via-yellow-500 to-orange-500"
    : "bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500";

  // 👇 PASTILLA DE PUNTOS BLINDADA E INTELIGENTE 👇
  const getPointsTag = () => {
    if (pointsWon === undefined || pointsWon === null) return null;

    const isSuccess = pointsWon > 0;

    // Colores obligados en Hexadecimal para que el navegador no los borre
    const bg = isSuccess
      ? "bg-[#0f172a] border-[#10b981] text-yellow-500"
      : "bg-[#0f172a] border-[#ef4444] text-red-500";
    const icon = isSuccess ? "✅" : "❌";

    // Deducción automática: Si no llega texto, usamos los puntos para adivinar
    let label = "";
    if (isSuccess) {
      const cond = (pointsCondition || "").toUpperCase();
      if (cond.includes("EXACT") || cond.includes("PLENO") || pointsWon === 5)
        label = "EXACTO";
      else if (cond.includes("DIFF") || cond.includes("DIF") || pointsWon === 3)
        label = "DIF. GOL";
      else if (
        cond.includes("WINNER") ||
        cond.includes("GANADOR") ||
        pointsWon === 1
      )
        label = "GANADOR";
      else label = cond || "ACIERTO";
    } else {
      label = "FALLO";
    }

    const displayPoints = isSuccess ? `+${pointsWon}` : `${pointsWon}`;

    return (
      <div
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${bg} text-[11px] font-black tracking-widest uppercase z-50 shadow-md opacity-100`}
      >
        <span>
          {icon} {label} {displayPoints}
        </span>
      </div>
    );
  };

  return (
    <div
      style={style}
      className={`shrink-0 group relative flex flex-col w-full bg-black/90 backdrop-blur-lg rounded-2xl border overflow-hidden transition-all duration-300 ${containerClasses} pb-1.5`}
    >
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 ${accentLineClasses}`}
      />

      {/* HEADER: Con MXXX y la Pastilla Inteligente */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-600/20 border-b border-white/20">
        <div
          className={`px-1.5 py-0.5 rounded-md ${isFinal ? "bg-amber-500/20" : "bg-gray-400"}`}
        >
          <span
            className={`text-[11px] font-bold tracking-[0.30em] ${isFinal ? "text-amber-200 drop-shadow-[0_0_5px_rgba(251,191,36,0.2)]" : "text-orange-800 drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]"}`}
          >
            {isFinal ? `🏆 ${matchCode}` : matchCode}
          </span>
        </div>
        {getPointsTag()}
      </div>

      <div className="flex flex-col px-2 py-2 gap-0">
        <BracketMatchRow
          seed={getDisplaySeed(homeTeam) || "1A"}
          teamName={getName(homeTeam) || homeTeam.name}
          score={homeScore}
          isWinner={homeWinner}
          isLocked={isLocked}
          onScoreChange={handleUserHomeScore}
          onWinnerChange={handleUserHomeWin}
          isTie={isTie}
        />

        <div className="h-px w-full bg-white/10 my-1" />

        <BracketMatchRow
          seed={getDisplaySeed(awayTeam) || "2B"}
          teamName={getName(awayTeam) || awayTeam.name}
          score={awayScore}
          isWinner={awayWinner}
          isLocked={isLocked}
          onScoreChange={handleUserAwayScore}
          onWinnerChange={handleUserAwayWin}
          isTie={isTie}
        />

        {/* 👇 MARCADOR OFICIAL PEQUEÑO, ELEGANTE Y ESTILO FASE DE GRUPOS 👇 */}
        {officialScore && (
          <div className="flex justify-center mt-2">
            <div className="px-2 py-[2px] rounded bg-[#eb380c] border border-white shadow-md">
              <span className="text-[11px] font-bold text-slate-300 tracking-wider">
                OFICIAL: {officialScore.home} - {officialScore.away}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
