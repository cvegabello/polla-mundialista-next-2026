"use client";
import React, { useState } from "react";
import { BracketMatchRow } from "@/components/bracket/BracketMatchRow";

// 📝 Añadimos 'style' a los props para recibir márgenes personalizados
export const BracketMatchCard = ({
  matchCode,
  homeTeam,
  awayTeam,
  style,
}: any) => {
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [homeWinner, setHomeWinner] = useState(false);
  const [awayWinner, setAwayWinner] = useState(false);

  return (
    <div
      /* 🎨 Aplicamos el style aquí para controlar el movimiento vertical */
      style={style}
      className="shrink-0 group relative flex flex-col w-full bg-black/90 backdrop-blur-lg rounded-2xl border border-white/80 shadow-2xl overflow-hidden transition-all duration-300 hover:border-orange-500/80 hover:shadow-[0_0_25px_rgba(249,115,22,0.80)]"
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-cyan-400 via-purple-500 to-pink-500" />

      <div className="flex items-center px-4 py-2 bg-gray-600/20 border-b border-white/20">
        <div className="bg-gray-400 px-3 py-0.5 rounded-md">
          <span className="text-[12px] font-bold text-fuchsia-800 tracking-[0.20em]">
            {matchCode}
          </span>
        </div>
      </div>

      <div className="flex flex-col p-3 gap-0.5">
        <BracketMatchRow
          seed={homeTeam?.seed || "1A"}
          teamName={homeTeam?.name || "POR DEFINIR"}
          score={homeScore}
          isWinner={homeWinner}
          onScoreChange={setHomeScore}
          onWinnerChange={() => {
            setHomeWinner(true);
            setAwayWinner(false);
          }}
        />

        <div className="h-px w-full bg-white/10 my-1" />

        <BracketMatchRow
          seed={awayTeam?.seed || "2B"}
          teamName={awayTeam?.name || "POR DEFINIR"}
          score={awayScore}
          isWinner={awayWinner}
          onScoreChange={setAwayScore}
          onWinnerChange={() => {
            setAwayWinner(true);
            setHomeWinner(false);
          }}
        />
      </div>
    </div>
  );
};
