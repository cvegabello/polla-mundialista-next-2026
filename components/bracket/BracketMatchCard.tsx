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
  style?: React.CSSProperties;
  lang?: "es" | "en";
  isFinal?: boolean;
  onAdvanceTeam?: (matchId: string | number, winner: TeamProps | null) => void;
  prediction?: any;
  onSavePrediction?: (
    matchId: string | number,
    hScore: number,
    aScore: number,
    winnerId: string,
  ) => void;
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
  prediction,
  onSavePrediction,
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
  const [homeWinner, setHomeWinner] = useState(false);
  const [awayWinner, setAwayWinner] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hScore = parseInt(homeScore);
  const aScore = parseInt(awayScore);
  const isComplete = !isNaN(hScore) && !isNaN(aScore);
  const isTie = isComplete && hScore === aScore;

  useEffect(() => {
    if (prediction?.predicted_winner) {
      if (homeTeam?.id === prediction.predicted_winner) setHomeWinner(true);
      if (awayTeam?.id === prediction.predicted_winner) setAwayWinner(true);
    }
  }, [homeTeam?.id, awayTeam?.id, prediction?.predicted_winner]);

  // EL CEREBRO DE LA TARJETA CON RASTREADORES 🕵️‍♂️
  useEffect(() => {
    // 🔵 RASTREADOR 1: Ver si el useEffect arranca cuando escribimos
    console.log(
      `\n🔵 [${matchCode}] useEffect disparado. homeScore: "${homeScore}", awayScore: "${awayScore}"`,
    );

    if (!isComplete) {
      // 🟡 RASTREADOR 2: Ver si se está frenando por falta de datos
      console.log(
        `🟡 [${matchCode}] Abortando: isComplete es FALSE (Faltan datos). hScore: ${hScore}, aScore: ${aScore}`,
      );

      setHomeWinner(false);
      setAwayWinner(false);
      if (onAdvanceTeam) onAdvanceTeam(matchId, null);
      return;
    }

    // 🟢 RASTREADOR 3: ¡Pasó la barrera!
    console.log(`🟢 [${matchCode}] isComplete es TRUE. Calculando ganador...`);

    let currentHomeWinner = homeWinner;
    let currentAwayWinner = awayWinner;

    if (hScore > aScore) {
      setHomeWinner(true);
      setAwayWinner(false);
      currentHomeWinner = true;
      currentAwayWinner = false;
      if (onAdvanceTeam) onAdvanceTeam(matchId, homeTeam);
    } else if (aScore > hScore) {
      setHomeWinner(false);
      setAwayWinner(true);
      currentHomeWinner = false;
      currentAwayWinner = true;
      if (onAdvanceTeam) onAdvanceTeam(matchId, awayTeam);
    } else {
      if (homeWinner && onAdvanceTeam) onAdvanceTeam(matchId, homeTeam);
      else if (awayWinner && onAdvanceTeam) onAdvanceTeam(matchId, awayTeam);
      else if (onAdvanceTeam) onAdvanceTeam(matchId, null);
    }

    const hasWinner =
      hScore !== aScore || (isTie && (currentHomeWinner || currentAwayWinner));
    const winnerId = currentHomeWinner
      ? homeTeam?.id
      : currentAwayWinner
        ? awayTeam?.id
        : null;

    // 🛠️ RASTREADOR 4: Ver los datos exactos que va a intentar guardar
    console.log(`🛠️ [${matchCode}] ESTADO PARA GUARDAR:`, {
      hasWinner,
      homeTeamId: homeTeam?.id,
      awayTeamId: awayTeam?.id,
      winnerId,
      tieneFuncionOnSave: !!onSavePrediction,
    });

    if (hasWinner && onSavePrediction) {
      if (winnerId) {
        console.log(
          `⏳ [${matchCode}] Iniciando cuenta regresiva (1 segundo) para guardar...`,
        );
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = setTimeout(() => {
          // 🚀 RASTREADOR 5: ¡Se disparó la función!
          console.log(`🚀 [${matchCode}] ¡Disparando guardado al backend! ->`, {
            matchId,
            hScore,
            aScore,
            winnerId,
          });
          onSavePrediction(matchId, hScore, aScore, winnerId);
        }, 1000);
      } else {
        console.warn(
          `❌ [${matchCode}] ABORTANDO GUARDADO: El winnerId es null (Seguro no se pasó el ID desde FanDashboard)`,
        );
      }
    } else if (!onSavePrediction) {
      console.warn(
        `❌ [${matchCode}] ABORTANDO GUARDADO: La función onSavePrediction no existe (No se pasó la prop)`,
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const containerClasses = isFinal
    ? "border-amber-400/90 shadow-[0_0_50px_rgba(251,191,36,0.6)] hover:border-amber-300 hover:shadow-[0_0_55px_rgba(251,191,36,0.9)] scale-[1.05] z-10"
    : "border-white/80 shadow-2xl hover:border-orange-500/80 hover:shadow-[0_0_25px_rgba(249,115,22,0.80)]";

  const accentLineClasses = isFinal
    ? "bg-gradient-to-b from-amber-200 via-yellow-500 to-orange-500"
    : "bg-gradient-to-b from-cyan-400 via-purple-500 to-pink-500";

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
