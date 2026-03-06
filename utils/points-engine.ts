// src/utils/points-engine.ts

// 1. Definimos la estructura de nuestra configuración (Espejo de su base de datos)
export interface ScoreConfig {
  exact_score: number; // Ej: 5
  goal_diff: number; // Ej: 3
  winner_only: number; // Ej: 1
  group_perfect?: number; // Ej: 10
  group_inverse?: number; // Ej: 5
  group_single?: number; // Ej: 2
  champ_initial?: number; // Ej: 10
  champ_final?: number; // Ej: 5
}

/**
 * ⚽ MOTOR DE PARTIDOS: Calcula los puntos de un partido individual
 * Aplica la jerarquía excluyente: EXACTO > DIF. GOL > GANADOR > FALLO
 */
export const calculateMatchPoints = (
  predHomeScore: number | null,
  predAwayScore: number | null,
  predWinnerId: string | null | undefined,
  offHomeScore: number | null,
  offAwayScore: number | null,
  offWinnerId: string | null | undefined,
  config: ScoreConfig,
): number => {
  // 🛡️ Filtro 1: Si no hay pronóstico o el partido oficial no se ha jugado, 0 puntos.
  if (
    predHomeScore === null ||
    predAwayScore === null ||
    offHomeScore === null ||
    offAwayScore === null
  ) {
    return 0;
  }

  // 🧠 FUNCIÓN INTERNA: Determina el desenlace real del partido
  const getResult = (h: number, a: number, wId: string | null | undefined) => {
    if (h > a) return "HOME_WIN";
    if (a > h) return "AWAY_WIN";
    // Si es empate, verificamos si hubo penales (winnerId). Si no, es un empate normal de fase de grupos.
    return wId ? `TIE_WON_BY_${wId}` : "TIE";
  };

  const predResult = getResult(predHomeScore, predAwayScore, predWinnerId);
  const offResult = getResult(offHomeScore, offAwayScore, offWinnerId);

  // ¿Acertó quién ganó (o si fue empate)?
  const hitResult = predResult === offResult;

  // ¿Acertó la diferencia de goles?
  const predDiff = predHomeScore - predAwayScore;
  const offDiff = offHomeScore - offAwayScore;
  const hitDiff = predDiff === offDiff;

  // ¿Acertó los goles exactos?
  const hitExactScores =
    predHomeScore === offHomeScore && predAwayScore === offAwayScore;
  // Para que sea "EXACTO", debe acertar los goles Y el ganador (vital en finales por los penales)
  const hitExact = hitExactScores && hitResult;

  // 🏆 APLICAMOS LA JERARQUÍA ESTRICTA
  if (hitExact) {
    return config.exact_score; // +5 Puntos
  } else if (hitResult && hitDiff) {
    return config.goal_diff; // +3 Puntos (Cubre el empate ej: Dijo 1-1, quedó 2-2)
  } else if (hitResult) {
    return config.winner_only; // +1 Punto
  }

  // Fallo total
  return 0;
};

/**
 * 🏆 MOTOR DE GRUPOS: Calcula los bonos por acertar los clasificados de un grupo
 * Retorna los puntos y el tipo de acierto para mostrar en la interfaz.
 */
export const calculateGroupBonusPoints = (
  predFirstId: string | null | undefined,
  predSecondId: string | null | undefined,
  offFirstId: string | null | undefined,
  offSecondId: string | null | undefined,
  config: ScoreConfig,
): { points: number; type: "PERFECT" | "INVERSE" | "SINGLE" | "NONE" } => {
  // 🛡️ Filtro: Si faltan datos oficiales o el fan no llenó, cero puntos.
  if (!offFirstId || !offSecondId || !predFirstId || !predSecondId) {
    return { points: 0, type: "NONE" };
  }

  // 🥇 REY DE GRUPO (+10): Acierta 1ro y 2do en el orden exacto
  if (predFirstId === offFirstId && predSecondId === offSecondId) {
    return { points: config.group_perfect || 0, type: "PERFECT" };
  }

  // 🥈 CLASIFICADOS INV (+5): Acierta los dos, pero al revés
  if (predFirstId === offSecondId && predSecondId === offFirstId) {
    return { points: config.group_inverse || 0, type: "INVERSE" };
  }

  // 🥉 1 ACIERTO (+2): Pega solo uno de los dos clasificados (en cualquier posición)
  let hits = 0;
  if (predFirstId === offFirstId || predFirstId === offSecondId) hits++;
  if (predSecondId === offFirstId || predSecondId === offSecondId) hits++;

  if (hits === 1) {
    return { points: config.group_single || 0, type: "SINGLE" };
  }

  // ❌ NADA: No le atinó a ninguno de los dos que pasaron
  return { points: 0, type: "NONE" };
};
