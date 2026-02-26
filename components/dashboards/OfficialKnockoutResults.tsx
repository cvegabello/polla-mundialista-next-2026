"use client";

import React from "react";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";
import { resolveBracketMatches } from "@/utils/bracket-resolver";
import {
  R32_MATCHUPS,
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";
import { Language, DICTIONARY } from "@/components/constants/dictionary";

interface OfficialKnockoutResultsProps {
  groupsData: any[]; // Para sacar las posiciones y los terceros
  officialWinners: Record<string, any>; // Aquí vendrán los ganadores reales de la DB
  officialScores: any[]; // Aquí vendrán los marcadores reales
  lang: Language;
}

export const OfficialKnockoutResults = ({
  groupsData,
  officialWinners,
  officialScores,
  lang,
}: OfficialKnockoutResultsProps) => {
  const t = DICTIONARY[lang];

  // Helper para pintar cada columna
  const renderColumn = (
    matchups: any[],
    phaseName: string,
    isFinal = false,
  ) => {
    // Resolvemos la llave con la verdad absoluta de la base de datos
    const resolvedMatches = resolveBracketMatches(
      groupsData,
      officialWinners,
      matchups,
    );

    return (
      <div className="flex flex-col gap-6 min-w-[280px]">
        <div className="bg-[#1a1b26]/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 text-center mb-2 shadow-lg">
          <h3 className="text-cyan-400 font-black tracking-widest uppercase text-sm drop-shadow-md">
            {phaseName}
          </h3>
        </div>

        {resolvedMatches.map((match, idx) => {
          // Buscamos si la FIFA ya jugó este partido en la vida real
          const officialMatchData = officialScores.find(
            (m) => m.match_id.toString() === match.id.toString(),
          );

          // Simulamos un objeto "prediction" para que la tarjeta pinte los goles
          // pero usando los datos OFICIALES
          const simulatedPrediction = officialMatchData
            ? {
                pred_home: officialMatchData.home_score,
                pred_away: officialMatchData.away_score,
                predicted_winner: officialMatchData.winner_id,
              }
            : undefined;

          return (
            <BracketMatchCard
              key={match.id}
              matchId={match.id}
              matchCode={`M${match.id}`}
              lang={lang}
              isFinal={isFinal && idx === 0}
              isLocked={true} // 👈 MAGIA: El fan no puede tocar nada
              style={
                isFinal && idx % 2 !== 0 ? { marginTop: "60px" } : undefined
              }
              homeTeam={{
                ...match.home,
                seed: match.h,
                name: match.home.id
                  ? lang === "en"
                    ? match.home.name_en || match.home.name_es
                    : match.home.name_es
                  : t.bracketTBD,
              }}
              awayTeam={{
                ...match.away,
                seed: match.a,
                name: match.away.id
                  ? lang === "en"
                    ? match.away.name_en || match.away.name_es
                    : match.away.name_es
                  : t.bracketTBD,
              }}
              prediction={simulatedPrediction} // Le inyectamos la verdad absoluta
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-x-auto pb-8 custom-scrollbar">
      <div className="flex gap-8 min-w-max p-4 items-start">
        {renderColumn(R32_MATCHUPS, t.phase32)}
        {renderColumn(R16_MATCHUPS, t.phase16)}
        {renderColumn(QF_MATCHUPS, t.phase8)}
        {renderColumn(SF_MATCHUPS, t.phase4)}
        {renderColumn(F_MATCHUPS, t.phase2, true)}
      </div>
    </div>
  );
};
