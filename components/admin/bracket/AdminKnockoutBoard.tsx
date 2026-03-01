"use client";

import React, { useState, useMemo, useEffect } from "react";
import { AdminBracketContainer } from "./AdminBracketContainer";
import { AdminPhaseColumn } from "./AdminPhaseColumn";
import { AdminBracketMatchCard, TeamProps } from "./AdminBracketMatchCard";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import {
  R32_MATCHUPS,
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";
import { resolveBracketMatches } from "@/utils/bracket-resolver";
import {
  saveOfficialScoreAction,
  syncBracketTeamsAction,
} from "@/lib/actions/super-admin-actions"; // 👈 IMPORTAMOS LA NUEVA ACCIÓN
import { calculateStandings } from "@/utils/standings";

interface AdminKnockoutBoardProps {
  groupsData: any[];
  officialMatches: any[];
  lang: Language;
}

// Unimos todos los partidos para el sincronizador maestro
const ALL_MATCHUPS = [
  ...R32_MATCHUPS,
  ...R16_MATCHUPS,
  ...QF_MATCHUPS,
  ...SF_MATCHUPS,
  ...F_MATCHUPS,
];

export const AdminKnockoutBoard = ({
  groupsData,
  officialMatches,
  lang,
}: AdminKnockoutBoardProps) => {
  const [localMatches, setLocalMatches] = useState<any[]>(
    officialMatches || [],
  );
  const [knockoutWinners, setKnockoutWinners] = useState<Record<string, any>>(
    {},
  );

  // 🧠 CEREBRO: Calculamos la tabla de posiciones oficial al vuelo
  const officialStandings = useMemo(() => {
    let all: any[] = [];
    groupsData
      .filter((g) => g.id !== "FI")
      .forEach((group) => {
        const groupLetter = group.name
          .replace(/Grupo /i, "")
          .replace(/Group /i, "")
          .trim();
        const table = calculateStandings(group.matches, lang);

        const teamDict: Record<string, any> = {};
        group.matches.forEach((m: any) => {
          if (m.home_team) teamDict[m.home_team.id] = m.home_team;
          if (m.away_team) teamDict[m.away_team.id] = m.away_team;
        });

        table.forEach((row: any, index: number) => {
          const tId = row.id || row.team_id || row.teamId;
          const fullTeam = teamDict[tId] || {};

          all.push({
            ...row,
            position: index + 1,
            group_id: groupLetter,
            team_id: tId,
            team: {
              name_es: fullTeam.name_es || row.team || row.name,
              name_en: fullTeam.name_en,
              flag_code: fullTeam.flag_code || row.flag_code || row.flag,
            },
          });
        });
      });
    return all;
  }, [groupsData, lang]);

  // 🌍 EL SINCRONIZADOR SILENCIOSO: Escribe el destino en la Base de Datos
  useEffect(() => {
    // 1. Calculamos cómo DEBERÍA verse todo el bracket según los resultados actuales
    const fullResolvedBracket = resolveBracketMatches(
      officialStandings,
      knockoutWinners,
      ALL_MATCHUPS,
    );
    const updates: any[] = [];

    // 2. Comparamos con lo que hay actualmente en la base de datos (localMatches)
    fullResolvedBracket.forEach((calcMatch) => {
      const dbMatch = localMatches.find(
        (m) => m.id?.toString() === calcMatch.id?.toString(),
      );
      if (dbMatch) {
        const dbHome = dbMatch.home_team_id || null;
        const dbAway = dbMatch.away_team_id || null;
        const calcHome = calcMatch.home?.id || null;
        const calcAway = calcMatch.away?.id || null;

        // Si el Cerebro detecta que un equipo avanzó y la BD no lo sabe, preparamos la actualización
        if (dbHome !== calcHome || dbAway !== calcAway) {
          updates.push({
            matchId: Number(calcMatch.id),
            homeTeamId: calcHome,
            awayTeamId: calcAway,
          });
        }
      }
    });

    // 3. Si hay diferencias, disparamos a la base de datos
    if (updates.length > 0) {
      syncBracketTeamsAction(updates)
        .then(() => {
          // Actualizamos nuestro estado local para evitar ciclos infinitos
          setLocalMatches((prev) =>
            prev.map((m) => {
              const upd = updates.find(
                (u) => u.matchId.toString() === m.id.toString(),
              );
              if (upd) {
                return {
                  ...m,
                  home_team_id: upd.homeTeamId,
                  away_team_id: upd.awayTeamId,
                };
              }
              return m;
            }),
          );
        })
        .catch((err) => console.error("Error en auto-sync:", err));
    }
  }, [officialStandings, knockoutWinners, localMatches]);

  const handleAdvanceTeam = (matchId: string | number, winnerData: any) => {
    setKnockoutWinners((prev) => ({
      ...prev,
      [matchId.toString()]: winnerData,
    }));
  };

  const handleSaveOfficial = async (
    matchId: string | number,
    hScore: number | null,
    aScore: number | null,
    winnerId: string | null,
  ) => {
    const safeWinnerId = winnerId === "" ? null : winnerId;

    try {
      setLocalMatches((prev) => {
        const exists = prev.find((m) => m.id === matchId);
        if (exists) {
          return prev.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  home_score: hScore,
                  away_score: aScore,
                  winner_id: safeWinnerId,
                }
              : m,
          );
        } else {
          return [
            ...prev,
            {
              id: matchId,
              home_score: hScore,
              away_score: aScore,
              winner_id: safeWinnerId,
            },
          ];
        }
      });

      await saveOfficialScoreAction(
        Number(matchId),
        hScore,
        aScore,
        safeWinnerId,
      );
    } catch (error) {
      console.error("Error guardando el partido oficial:", error);
    }
  };

  const renderPhase = (title: string, matchups: any[], isFinal = false) => {
    const resolvedMatches = resolveBracketMatches(
      officialStandings,
      knockoutWinners,
      matchups,
    );

    return (
      <AdminPhaseColumn title={title}>
        {resolvedMatches.map((m) => {
          const matchData = localMatches.find(
            (om) => om.id?.toString() === m.id?.toString(),
          );

          return (
            <AdminBracketMatchCard
              key={m.id}
              matchId={m.id}
              matchCode={m.code || `M${m.id}`}
              homeTeam={{ ...(m.home as any), seed: m.h } as TeamProps}
              awayTeam={{ ...(m.away as any), seed: m.a } as TeamProps}
              lang={lang}
              isFinal={isFinal}
              officialMatch={matchData}
              onSaveOfficial={handleSaveOfficial}
              onAdvanceTeam={handleAdvanceTeam}
            />
          );
        })}
      </AdminPhaseColumn>
    );
  };

  return (
    <div className="w-full max-w-full mx-auto animate-fade-in">
      <AdminBracketContainer>
        {renderPhase(
          lang === "en" ? "ROUND OF 32" : "16 AVOS DE FINAL",
          R32_MATCHUPS,
        )}
        {renderPhase(
          lang === "en" ? "ROUND OF 16" : "OCTAVOS DE FINAL",
          R16_MATCHUPS,
        )}
        {renderPhase(
          lang === "en" ? "QUARTERFINALS" : "CUARTOS DE FINAL",
          QF_MATCHUPS,
        )}
        {renderPhase(lang === "en" ? "SEMIFINALS" : "SEMIFINALES", SF_MATCHUPS)}
        {renderPhase(
          lang === "en" ? "FINAL & 3RD PLACE" : "FINAL Y 3ER PUESTO",
          F_MATCHUPS,
          true,
        )}
      </AdminBracketContainer>
    </div>
  );
};
