// src/utils/bracket-resolver.ts
import { R32_MATCHUPS } from "@/components/constants/matchups";

export const resolveBracketMatches = (standings: any[], lang: string) => {
  // 1. Mapa rápido para buscar por Semilla (A1, B2, etc.)
  const seedsMap: Record<string, any> = {};
  standings.forEach((s) => {
    const key = `${s.group_id}${s.position}`; // Ej: "A1"
    seedsMap[key] = {
      id: s.team_id,
      name: lang === "en" ? s.team.name_en || s.team.name_es : s.team.name_es,
      flag: s.team.flag_code,
    };
  });

  // 2. Lógica de Mejores Terceros (Top 8)
  const allThirds = standings
    .filter((s) => s.position === 3)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.dg !== a.dg) return b.dg - a.dg;
      return b.gf - a.gf;
    });

  const best8Thirds = allThirds.slice(0, 8);
  const best8Groups = best8Thirds.map((t) => t.group_id);

  // 3. Resolución de Llaves
  return R32_MATCHUPS.map((match) => {
    const resolveSide = (seedCode: string) => {
      // Caso A: Semilla Directa (A1, B2...)
      if (seedsMap[seedCode]) return seedsMap[seedCode];

      // Caso B: Mejor Tercero (T_...)
      if (seedCode.startsWith("T_")) {
        // Buscamos el mejor tercero que pertenezca a los grupos permitidos en el código
        const possibleGroups = seedCode.replace("T_", "").split("");
        const found = best8Thirds.find((t) =>
          possibleGroups.includes(t.group_id),
        );
        if (found) {
          return {
            id: found.team_id,
            name:
              lang === "en"
                ? found.team.name_en || found.team.name_es
                : found.team.name_es,
            flag: found.team.flag_code,
          };
        }
      }
      return { id: null, name: seedCode, flag: null }; // Fallback al código (Ej: "A1")
    };

    return {
      ...match,
      home: resolveSide(match.h),
      away: resolveSide(match.a),
    };
  });
};
