// src/utils/standings.ts
import { MatchReal, TableStats, Team } from "@/types";

export const calculateStandings = (
  matches: MatchReal[],
  lang: string = "es",
): TableStats[] => {
  const stats: Record<string, any> = {};

  const getName = (team: any) =>
    lang === "en" ? team.name_en || team.name_es : team.name_es;

  // 🧪 PUNTO DE CONTROL 1: Ver si el primer partido trae los IDs
  if (matches.length > 0) {
    console.log("🔍 DEBUG 1 - Objeto Match:", {
      matchId: matches[0].id,
      homeTeamId: matches[0].home_team_id,
      homeTeamObject: matches[0].home_team,
    });
  }

  // 1. Inicializar estadísticas
  matches.forEach((m: any) => {
    // Buscamos el ID en todas las ubicaciones posibles
    const hId = m.home_team_id || m.home_team?.id;
    const aId = m.away_team_id || m.away_team?.id;

    if (hId && !stats[hId]) {
      stats[hId] = {
        teamId: hId,
        name: getName(m.home_team),
        pts: 0,
        gf: 0,
        gc: 0,
        played: 0,
        won: 0,
        tied: 0,
        lost: 0,
      };
    }
    if (aId && !stats[aId]) {
      stats[aId] = {
        teamId: aId,
        name: getName(m.away_team),
        pts: 0,
        gf: 0,
        gc: 0,
        played: 0,
        won: 0,
        tied: 0,
        lost: 0,
      };
    }
  });

  // 2. Calcular rendimiento
  matches.forEach((m: any) => {
    const hId = m.home_team_id || m.home_team?.id;
    const aId = m.away_team_id || m.away_team?.id;

    if (hId && aId && m.home_score != null && m.away_score != null) {
      const h = Number(m.home_score);
      const a = Number(m.away_score);

      stats[hId].played += 1;
      stats[aId].played += 1;
      stats[hId].gf += h;
      stats[hId].gc += a;
      stats[aId].gf += a;
      stats[aId].gc += h;

      if (h > a) {
        stats[hId].pts += 3;
        stats[hId].won += 1;
        stats[aId].lost += 1;
      } else if (a > h) {
        stats[aId].pts += 3;
        stats[aId].won += 1;
        stats[hId].lost += 1;
      } else {
        stats[hId].pts += 1;
        stats[aId].pts += 1;
        stats[hId].tied += 1;
        stats[aId].tied += 1;
      }
    }
  });

  // 3. Convertir a Array con el ID garantizado
  let sortedTeams = Object.values(stats).map((s: any) => ({
    teamId: s.teamId, // 👈 Esto DEBE ser el UUID
    team: s.name,
    pts: s.pts,
    gf: s.gf,
    gc: s.gc,
    played: s.played,
    won: s.won,
    tied: s.tied,
    lost: s.lost,
    dg: s.gf - s.gc,
    pos: 0,
    isTied: false,
  }));

  // 🧪 PUNTO DE CONTROL 2: Ver si el array final tiene el teamId
  console.log("🔍 DEBUG 2 - Array generado:", sortedTeams[0]);

  sortedTeams.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

  const finalData = sortedTeams.map((item, index, arr) => {
    const isTied =
      index > 0 &&
      arr[index - 1].pts === item.pts &&
      arr[index - 1].dg === item.dg &&
      arr[index - 1].gf === item.gf;
    if (isTied) arr[index - 1].isTied = true;
    return { ...item, pos: index + 1, isTied: isTied || item.isTied };
  }) as TableStats[];

  return finalData;
};
