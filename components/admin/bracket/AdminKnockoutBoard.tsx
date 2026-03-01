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
} from "@/lib/actions/super-admin-actions";
import { calculateStandings } from "@/utils/standings";

interface AdminKnockoutBoardProps {
  groupsData: any[];
  officialMatches: any[];
  lang: Language;
}

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

  const availableThirds = useMemo(() => {
    return officialStandings
      .filter((team) => team.position === 3)
      .map((t) => ({
        id: t.team_id,
        name: t.team.name_es,
        name_es: t.team.name_es,
        name_en: t.team.name_en,
        flag: t.team.flag_code,
        group: t.group_id,
        seed: `3${t.group_id}`,
      })) as TeamProps[];
  }, [officialStandings]);

  useEffect(() => {
    const fullResolvedBracket = resolveBracketMatches(
      officialStandings,
      knockoutWinners,
      ALL_MATCHUPS,
    );
    const updates: any[] = [];

    fullResolvedBracket.forEach((calcMatch) => {
      const dbMatch = localMatches.find(
        (m) => m.id?.toString() === calcMatch.id?.toString(),
      );
      if (dbMatch) {
        const dbHome = dbMatch.home_team_id || null;
        const dbAway = dbMatch.away_team_id || null;
        const calcHome = calcMatch.home?.id || null;
        const calcAway = calcMatch.away?.id || null;

        const isHomeThird = calcMatch.h?.startsWith("T_");
        const isAwayThird = calcMatch.a?.startsWith("T_");

        const finalHome = isHomeThird && dbHome ? dbHome : calcHome;
        const finalAway = isAwayThird && dbAway ? dbAway : calcAway;

        if (dbHome !== finalHome || dbAway !== finalAway) {
          updates.push({
            matchId: Number(calcMatch.id),
            homeTeamId: finalHome,
            awayTeamId: finalAway,
          });
        }
      }
    });

    if (updates.length > 0) {
      syncBracketTeamsAction(updates)
        .then(() => {
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

  const handleManualThirdChange = async (
    matchId: string | number,
    side: "home" | "away",
    newTeamId: string,
  ) => {
    const currentMatch =
      localMatches.find((m) => m.id?.toString() === matchId.toString()) || {};

    const newHomeId =
      side === "home" ? newTeamId || null : currentMatch.home_team_id || null;
    const newAwayId =
      side === "away" ? newTeamId || null : currentMatch.away_team_id || null;

    // 👇 MAGIA 1: Si el equipo que acabamos de reemplazar ERA EL QUE IBA GANANDO,
    // heredamos esa victoria al nuevo equipo automáticamente.
    let newWinnerId = currentMatch.winner_id;
    if (
      currentMatch.winner_id === currentMatch.home_team_id &&
      side === "home"
    ) {
      newWinnerId = newTeamId;
    } else if (
      currentMatch.winner_id === currentMatch.away_team_id &&
      side === "away"
    ) {
      newWinnerId = newTeamId;
    }

    setLocalMatches((prev) =>
      prev.map((m) =>
        m.id?.toString() === matchId.toString()
          ? {
              ...m,
              home_team_id: newHomeId,
              away_team_id: newAwayId,
              winner_id: newWinnerId,
            }
          : m,
      ),
    );

    try {
      await syncBracketTeamsAction([
        {
          matchId: Number(matchId),
          homeTeamId: newHomeId,
          awayTeamId: newAwayId,
        },
      ]);

      // Si el ganador cambió, aseguramos que la base de datos lo sepa para avanzar al equipo correcto
      if (newWinnerId !== currentMatch.winner_id) {
        await saveOfficialScoreAction(
          Number(matchId),
          currentMatch.home_score,
          currentMatch.away_score,
          newWinnerId,
        );
      }
    } catch (error) {
      console.error("Error guardando el tercero manual:", error);
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

          const homeTeamData = { ...(m.home as any), seed: m.h };
          const awayTeamData = { ...(m.away as any), seed: m.a };

          // 👇 MAGIA 2: Si es un tercero modificado manualmente, no solo le pasamos el nombre,
          // sino que le inyectamos la bandera, el name_es y el GRUPO para que el label (3A, 3F) cambie solo.
          if (m.h?.startsWith("T_") && matchData?.home_team_id) {
            const manualTeam = availableThirds.find(
              (t) => t.id === matchData.home_team_id,
            );
            if (manualTeam) {
              homeTeamData.id = manualTeam.id;
              homeTeamData.name = manualTeam.name;
              homeTeamData.name_es = manualTeam.name_es;
              homeTeamData.name_en = manualTeam.name_en;
              homeTeamData.flag = manualTeam.flag;
              homeTeamData.group = manualTeam.group; // Esto cambia el label rojo!
            }
          }
          if (m.a?.startsWith("T_") && matchData?.away_team_id) {
            const manualTeam = availableThirds.find(
              (t) => t.id === matchData.away_team_id,
            );
            if (manualTeam) {
              awayTeamData.id = manualTeam.id;
              awayTeamData.name = manualTeam.name;
              awayTeamData.name_es = manualTeam.name_es;
              awayTeamData.name_en = manualTeam.name_en;
              awayTeamData.flag = manualTeam.flag;
              awayTeamData.group = manualTeam.group; // Esto cambia el label rojo!
            }
          }

          return (
            <AdminBracketMatchCard
              key={m.id}
              matchId={m.id}
              matchCode={m.code || `M${m.id}`}
              homeTeam={homeTeamData as TeamProps}
              awayTeam={awayTeamData as TeamProps}
              lang={lang}
              isFinal={isFinal}
              officialMatch={matchData}
              onSaveOfficial={handleSaveOfficial}
              onAdvanceTeam={handleAdvanceTeam}
              availableThirds={availableThirds}
              onManualThirdChange={handleManualThirdChange}
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
