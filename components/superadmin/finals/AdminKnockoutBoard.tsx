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
  // 📺 === INICIO DEL VAR ===
  console.log("=== VAR: ¿QUÉ TRAE EXACTAMENTE UN PARTIDO? ===");
  console.log(
    "Muestra del partido en la posición 72 del array:",
    officialMatches[72],
  );

  // Vamos a buscar específicamente el partido 73 (o el que usted haya probado)
  const partido73 = officialMatches?.find(
    (m) => m.match_number?.toString() === "73" || m.id?.toString() === "73",
  );
  console.log("🔍 Radiografía del Partido 73:", partido73);
  console.log("================================");
  // 📺 === FIN DEL VAR ===

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
      // 🚀 BALA DE PLATA: Buscar por match_number o id
      const dbMatch = localMatches.find(
        (m) =>
          m.match_number?.toString() === calcMatch.id?.toString() ||
          m.id?.toString() === calcMatch.id?.toString(),
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
              // 🚀 BALA DE PLATA: Actualizar en memoria buscando por match_number o id
              const upd = updates.find(
                (u) =>
                  u.matchId.toString() === m.match_number?.toString() ||
                  u.matchId.toString() === m.id?.toString(),
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
        // 🚀 BALA DE PLATA: Buscar si ya existe por match_number o id
        const exists = prev.find(
          (m) =>
            m.match_number?.toString() === matchId.toString() ||
            m.id?.toString() === matchId.toString(),
        );
        if (exists) {
          return prev.map((m) =>
            m.match_number?.toString() === matchId.toString() ||
            m.id?.toString() === matchId.toString()
              ? {
                  ...m,
                  home_score: hScore,
                  away_score: aScore,
                  winner_id: safeWinnerId,
                }
              : m,
          );
        } else {
          // Si por alguna razón no existe localmente, lo creamos con id y match_number igual para salir del paso en UI
          return [
            ...prev,
            {
              id: matchId,
              match_number: matchId,
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
    // 🚀 BALA DE PLATA: Buscar partido por match_number o id
    const currentMatch =
      localMatches.find(
        (m) =>
          m.match_number?.toString() === matchId.toString() ||
          m.id?.toString() === matchId.toString(),
      ) || {};

    const newHomeId =
      side === "home" ? newTeamId || null : currentMatch.home_team_id || null;
    const newAwayId =
      side === "away" ? newTeamId || null : currentMatch.away_team_id || null;

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
        m.match_number?.toString() === matchId.toString() ||
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
          // 🚀 BALA DE PLATA: Buscar el partido oficial para pintar los goles
          const matchData = localMatches.find(
            (om) =>
              om.match_number?.toString() === m.id?.toString() ||
              om.id?.toString() === m.id?.toString(),
          );

          const homeTeamData = { ...(m.home as any), seed: m.h };
          const awayTeamData = { ...(m.away as any), seed: m.a };

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
              homeTeamData.group = manualTeam.group;
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
              awayTeamData.group = manualTeam.group;
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
