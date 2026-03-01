"use client";

import React, { useMemo } from "react";
import { BracketMatchCard } from "@/components/bracket/BracketMatchCard";
import { BracketContainer } from "@/components/bracket/BracketContainer";
import { PhaseColumn } from "@/components/bracket/PhaseColumn";
// 🗑️ Se fue resolveBracketMatches porque ya no calculamos nada
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

  // 🧠 EL TRUCO MAGISTRAL: Un diccionario rápido para saber el grupo de cualquier equipo
  // Esto mapea { "uuid-de-japon": "E", "uuid-de-colombia": "C" } sin tocar la BD
  const teamGroupMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (groupsData) {
      groupsData.forEach((g) => {
        if (g.id === "FI") return; // Ignoramos la fase final
        // Sacamos solo la letra ("A", "B", etc.)
        const letter = g.name
          .replace(/Grupo /i, "")
          .replace(/Group /i, "")
          .trim();
        // Recorremos sus partidos para anotar a todos los equipos
        g.matches?.forEach((m: any) => {
          if (m.home_team_id) map[m.home_team_id] = letter;
          if (m.away_team_id) map[m.away_team_id] = letter;
        });
      });
    }
    return map;
  }, [groupsData]);

  // Helper maestro para renderizar las fases inyectando la "verdad absoluta" de la DB
  const renderPhase = (
    matchups: any[],
    isFinal = false,
    getStyles: (idx: number) => React.CSSProperties,
  ) => {
    // 🧠 AHORA ES "BRUTO": Mapeamos directamente los matchups (R32, R16) sin calcular.
    // Al mantener el map así, su parámetro 'idx' queda INTACTO y las tarjetas no se mueven ni un milímetro.
    return matchups.map((match, idx) => {
      // 1. Buscamos el partido oficial en la BD (Soporta id o match_id por seguridad)
      const officialMatchData = officialScores.find(
        (m) =>
          m.id?.toString() === match.id.toString() ||
          m.match_id?.toString() === match.id.toString(),
      );

      // 2. Extraemos la verdad absoluta de los equipos que vienen de Supabase
      const dbHome = officialMatchData?.home_team || {};
      const dbAway = officialMatchData?.away_team || {};

      // 3. Simulamos la predicción con los datos de la DB para que la tarjeta los pinte
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
          style={getStyles(idx)} // 📏 MÁRGENES EXACTAS (Intactas)
          homeTeam={{
            id: officialMatchData?.home_team_id || null,
            seed: match.h, // "1A", "W73", etc.
            group: officialMatchData?.home_team_id
              ? teamGroupMap[officialMatchData.home_team_id]
              : null, // 👈 EL TRUCO INYECTADO
            name: dbHome.name_es
              ? lang === "en"
                ? dbHome.name_en || dbHome.name_es
                : dbHome.name_es
              : t.bracketTBD,
            flag: dbHome.flag_code || dbHome.flag || null,
          }}
          awayTeam={{
            id: officialMatchData?.away_team_id || null,
            seed: match.a, // "2B", "L101", etc.
            group: officialMatchData?.away_team_id
              ? teamGroupMap[officialMatchData.away_team_id]
              : null, // 👈 EL TRUCO INYECTADO
            name: dbAway.name_es
              ? lang === "en"
                ? dbAway.name_en || dbAway.name_es
                : dbAway.name_es
              : t.bracketTBD,
            flag: dbAway.flag_code || dbAway.flag || null,
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
