// src/utils/bracket-resolver.ts
import {
  R32_MATCHUPS,
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";

// Añadimos parámetros: knockoutWinners y targetMatchups (por defecto R32)
export const resolveBracketMatches = (
  standings: any[],
  knockoutWinners: Record<string, any> = {},
  targetMatchups: any[] = R32_MATCHUPS,
) => {
  if (!standings || standings.length === 0) {
    return targetMatchups.map((match) => ({
      ...match,
      home: { id: null, name_es: match.h, name_en: match.h, flag: null },
      away: { id: null, name_es: match.a, name_en: match.a, flag: null },
    }));
  }

  // 1. Tu lógica original de SeedsMap (INTACTA)
  const seedsMap: Record<string, any> = {};
  standings.forEach((s) => {
    const pos = s.position || s.pos;
    const key = `${s.group_id}${pos}`;
    seedsMap[key] = {
      id: s.team_id || s.teamId,
      name_es: s.team?.name_es,
      name_en: s.team?.name_en || s.team?.name_es,
      flag: s.team?.flag_code,
      group: s.group_id,
    };
  });

  // 2. Tu lógica original de Mejores Terceros (INTACTA)
  const allThirds = standings
    .filter((s) => (s.position || s.pos) === 3)
    .sort((a, b) => {
      if (b.points !== a.points) return (b.points || 0) - (a.points || 0);
      if (b.dg !== a.dg) return (b.dg || 0) - (a.dg || 0);
      return (b.gf || 0) - (a.gf || 0);
    });

  const best8Thirds = allThirds.slice(0, 8).map((s) => ({
    id: s.team_id || s.teamId,
    name_es: s.team?.name_es,
    name_en: s.team?.name_en || s.team?.name_es,
    flag: s.team?.flag_code,
    group: s.group_id,
  }));

  const allocatedTeamIds = new Set<string>();
  const thirdPlaceAssignments: Record<string, any> = {};

  // Aquí usamos R32_MATCHUPS fijo para calcular terceros una sola vez
  R32_MATCHUPS.forEach((match) => {
    [match.h, match.a].forEach((code) => {
      if (code.startsWith("T_") && !thirdPlaceAssignments[code]) {
        const allowedGroups = code.replace("T_", "").split("");
        let assignedTeam = best8Thirds.find(
          (t) => allowedGroups.includes(t.group) && !allocatedTeamIds.has(t.id),
        );
        if (!assignedTeam)
          assignedTeam = best8Thirds.find((t) => !allocatedTeamIds.has(t.id));
        if (assignedTeam) {
          allocatedTeamIds.add(assignedTeam.id);
          thirdPlaceAssignments[code] = assignedTeam;
        }
      }
    });
  });

  // 3. El Motor de Resolución (Ahora soporta W y L recursivo)
  const resolveSide = (seedCode: string): any => {
    if (!seedCode) return { id: null, name_es: "TBD", flag: null };
    if (seedsMap[seedCode]) return seedsMap[seedCode];
    if (seedCode.startsWith("T_"))
      return (
        thirdPlaceAssignments[seedCode] || {
          id: null,
          name_es: seedCode,
          flag: null,
        }
      );

    // Lógica para Ganadores y Perdedores
    if (seedCode.startsWith("W") || seedCode.startsWith("L")) {
      const isWinnerReq = seedCode.startsWith("W");
      const prevMatchId = seedCode.substring(1);
      const winnerData = knockoutWinners[prevMatchId];

      if (winnerData && winnerData.id) {
        if (isWinnerReq) return winnerData;

        // Búsqueda del perdedor
        const allPossible = [
          ...R32_MATCHUPS,
          ...R16_MATCHUPS,
          ...QF_MATCHUPS,
          ...SF_MATCHUPS,
          ...F_MATCHUPS,
        ];
        const prevMatch = allPossible.find(
          (m) => m.id.toString() === prevMatchId,
        );
        if (prevMatch) {
          const h = resolveSide(prevMatch.h);
          const a = resolveSide(prevMatch.a);
          return h.id === winnerData.id ? a : h;
        }
      }
    }
    return { id: null, name_es: seedCode, flag: null };
  };

  // 4. Mapeamos los matchups que nos pidan (targetMatchups)
  return targetMatchups.map((match) => ({
    ...match,
    home: resolveSide(match.h),
    away: resolveSide(match.a),
  }));
};
