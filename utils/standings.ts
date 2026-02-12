// src/utils/standings.ts
import { MatchReal, TableStats, Team } from "@/types";

export const calculateStandings = (
  matches: MatchReal[],
  lang: string = "es",
): TableStats[] => {
  const stats: Record<string, { pts: 0; gf: 0; gc: 0 }> = {};

  // Helper interno para obtener nombre
  const getName = (team: Team) =>
    lang === "en" ? team.name_en || team.name_es : team.name_es;

  // 1. Inicializar estadísticas
  matches.forEach((m) => {
    const hName = getName(m.home_team);
    const aName = getName(m.away_team);
    if (!stats[hName]) stats[hName] = { pts: 0, gf: 0, gc: 0 };
    if (!stats[aName]) stats[aName] = { pts: 0, gf: 0, gc: 0 };
  });

  // 2. Calcular puntos y goles
  matches.forEach((m) => {
    if (m.home_score != null && m.away_score != null) {
      const h = Number(m.home_score);
      const a = Number(m.away_score);
      const hName = getName(m.home_team);
      const aName = getName(m.away_team);

      stats[hName].gf += h;
      stats[hName].gc += a;
      stats[aName].gf += a;
      stats[aName].gc += h;

      if (h > a) stats[hName].pts += 3;
      else if (a > h) stats[aName].pts += 3;
      else {
        stats[hName].pts += 1;
        stats[aName].pts += 1;
      }
    }
  });

  // 3. Convertir a Array y Ordenar
  let sortedTeams = Object.entries(stats).map(([team, data]) => ({
    team,
    pts: data.pts,
    gf: data.gf,
    gc: data.gc,
    dg: data.gf - data.gc,
    pos: 0,
    isTied: false,
  }));

  // Criterios de desempate: Puntos > Diferencia Gol > Goles a Favor
  sortedTeams.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    return b.gf - a.gf;
  });

  // 4. Asignar Posiciones y detectar Empates
  const finalData = sortedTeams.map((item, index, array) => {
    let isTied = false;
    // Miramos si el anterior tiene exactamente los mismos números
    if (index > 0) {
      const prev = array[index - 1];
      if (prev.pts === item.pts && prev.dg === item.dg && prev.gf === item.gf) {
        isTied = true;
        prev.isTied = true; // Marcamos también al anterior
      }
    }
    return { ...item, pos: index + 1, isTied: isTied || item.isTied };
  });

  return finalData;
};
