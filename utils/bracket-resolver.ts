// src/utils/bracket-resolver.ts
import { R32_MATCHUPS } from "@/components/constants/matchups";

export const resolveBracketMatches = (standings: any[]) => {
  // Prevención de seguridad inicial
  if (!standings || standings.length === 0) {
    return R32_MATCHUPS.map((match) => ({
      ...match,
      home: { id: null, name_es: match.h, name_en: match.h, flag: null },
      away: { id: null, name_es: match.a, name_en: match.a, flag: null },
    }));
  }

  // 1. Mapa rápido para buscar por Semilla Directa (A1, B2, etc.)
  const seedsMap: Record<string, any> = {};
  standings.forEach((s) => {
    // Soportamos pos o position por si cambia en DB
    const pos = s.position || s.pos;
    const key = `${s.group_id}${pos}`; // Ej: "A1"

    seedsMap[key] = {
      id: s.team_id || s.teamId,
      name_es: s.team?.name_es,
      name_en: s.team?.name_en || s.team?.name_es,
      flag: s.team?.flag_code,
      group: s.group_id,
    };
  });

  // 2. Lógica de Mejores Terceros (Top 8)
  const allThirds = standings
    .filter((s) => (s.position || s.pos) === 3)
    .sort((a, b) => {
      if (b.points !== a.points) return (b.points || 0) - (a.points || 0);
      if (b.dg !== a.dg) return (b.dg || 0) - (a.dg || 0);
      return (b.gf || 0) - (a.gf || 0);
    });

  // Nos quedamos solo con los 8 primeros y normalizamos el objeto
  const best8Thirds = allThirds.slice(0, 8).map((s) => ({
    id: s.team_id || s.teamId,
    name_es: s.team?.name_es,
    name_en: s.team?.name_en || s.team?.name_es,
    flag: s.team?.flag_code,
    group: s.group_id,
  }));

  // 3. 🧩 Matriz de Asignación Única (El control anti-clones)
  const allocatedTeamIds = new Set<string>(); // Aquí anotamos los que ya pasaron
  const thirdPlaceAssignments: Record<string, any> = {};

  // Extraemos qué llaves necesitan un tercero
  const thirdPlaceCodes = R32_MATCHUPS.reduce((acc: string[], match) => {
    if (match.h.startsWith("T_")) acc.push(match.h);
    if (match.a.startsWith("T_")) acc.push(match.a);
    return acc;
  }, []);

  // Repartimos los equipos asegurando que nadie se repita
  thirdPlaceCodes.forEach((code) => {
    const allowedGroups = code.replace("T_", "").split("");

    // Buscamos el primero que cumpla la regla Y que no esté en la lista de anotados
    let assignedTeam = best8Thirds.find(
      (t) => allowedGroups.includes(t.group) && !allocatedTeamIds.has(t.id),
    );

    // 🛟 FALLBACK DE PÁNICO: Si no hay match perfecto (grupos incompletos),
    // metemos al primer tercero libre para que el Bracket siga funcionando.
    if (!assignedTeam) {
      assignedTeam = best8Thirds.find((t) => !allocatedTeamIds.has(t.id));
    }

    // Si encontramos a alguien, lo matriculamos
    if (assignedTeam) {
      allocatedTeamIds.add(assignedTeam.id);
      thirdPlaceAssignments[code] = assignedTeam;
    }
  });

  // 4. Resolución de Llaves Final
  return R32_MATCHUPS.map((match) => {
    const resolveSide = (seedCode: string) => {
      // Caso A: Semilla Directa (A1, B2...)
      if (seedsMap[seedCode]) return seedsMap[seedCode];

      // Caso B: Mejor Tercero (T_...) buscándolo en nuestro diccionario ya asignado
      if (seedCode.startsWith("T_") && thirdPlaceAssignments[seedCode]) {
        return thirdPlaceAssignments[seedCode];
      }

      // Caso C: Fallback al código si aún no hay equipo (Ej: "A1")
      return { id: null, name: seedCode, flag: null };
    };

    return {
      ...match,
      home: resolveSide(match.h),
      away: resolveSide(match.a),
    };
  });
};
