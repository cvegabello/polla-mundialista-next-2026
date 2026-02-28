"use client";

import React from "react";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";
import { BracketContainer } from "@/components/bracket/BracketContainer";
import { PhaseColumn } from "@/components/bracket/PhaseColumn";
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
  groupsData: any[];
  officialWinners: Record<string, any>;
  officialScores: any[];
  lang: Language;
}

export const OfficialKnockoutResults = ({
  groupsData,
  officialWinners,
  officialScores,
  lang,
}: OfficialKnockoutResultsProps) => {
  const t = DICTIONARY[lang];

  // Helper maestro para renderizar las fases inyectando la "verdad absoluta" de la DB
  const renderPhase = (
    matchups: any[],
    isFinal = false,
    getStyles: (idx: number) => React.CSSProperties,
  ) => {
    const resolvedMatches = resolveBracketMatches(
      groupsData,
      officialWinners,
      matchups,
    );

    return resolvedMatches.map((match, idx) => {
      const officialMatchData = officialScores.find(
        (m) => m.match_id.toString() === match.id.toString(),
      );

      // Simulamos la predicción con los datos de la DB para que la tarjeta los pinte
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
          isLocked={true} // 🔒 CANDADO PUESTO
          style={getStyles(idx)} // 📏 MÁRGENES EXACTAS
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
          prediction={simulatedPrediction}
        />
      );
    });
  };

  return (
    <div className={`max-w-[1600px] mx-auto mt-4`}>
      <BracketContainer>
        <PhaseColumn
          title={t.bracketPhaseR32Full}
          isActive={true}
          lang={lang}
          showFloating={false}
          isOfficial={true}
        >
          {renderPhase(R32_MATCHUPS, false, (idx) =>
            idx % 2 !== 0 ? { marginTop: "-8px" } : { marginTop: "15px" },
          )}
        </PhaseColumn>

        <PhaseColumn
          title={t.bracketPhaseR16Full}
          isActive={false}
          lang={lang}
          showFloating={false}
          isOfficial={true}
        >
          {renderPhase(R16_MATCHUPS, false, (idx) =>
            idx % 10 !== 0 ? { marginTop: "125px" } : { marginTop: "65px" },
          )}
        </PhaseColumn>

        <PhaseColumn
          title={t.bracketPhaseQFFull}
          isActive={false}
          lang={lang}
          showFloating={false}
          isOfficial={true}
        >
          {renderPhase(QF_MATCHUPS, false, (idx) =>
            idx % 10 !== 0 ? { marginTop: "360px" } : { marginTop: "200px" },
          )}
        </PhaseColumn>

        <PhaseColumn
          title={t.bracketPhaseSFFull}
          isActive={false}
          lang={lang}
          showFloating={false}
          isOfficial={true}
        >
          {renderPhase(SF_MATCHUPS, false, (idx) =>
            idx % 10 !== 0 ? { marginTop: "850px" } : { marginTop: "450px" },
          )}
        </PhaseColumn>

        <PhaseColumn
          title={t.bracketPhaseFTitle}
          isActive={false}
          lang={lang}
          showFloating={false}
          isOfficial={true}
        >
          {renderPhase(F_MATCHUPS, true, (idx) =>
            idx % 2 !== 0 ? { marginTop: "60px" } : { marginTop: "15px" },
          )}
        </PhaseColumn>
      </BracketContainer>
    </div>
    // Reutilizamos su BracketContainer para heredar el scroll horizontal
  );
};
