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
 * ⚽ MOTOR DE PARTIDOS (LA LÓGICA MAESTRA): Calcula los puntos de un partido individual.
 * Evalúa los 90/120 minutos (el marcador puro) de forma independiente a los penaltis.
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

  // 🧠 1. EVALUAMOS EL MARCADOR (Independiente de los penaltis)
  const predDiff = predHomeScore - predAwayScore;
  const offDiff = offHomeScore - offAwayScore;

  // ¿Quién ganó en cancha? (o si fue empate)
  const predBaseOutcome =
    predDiff > 0 ? "HOME_WIN" : predDiff < 0 ? "AWAY_WIN" : "TIE";
  const offBaseOutcome =
    offDiff > 0 ? "HOME_WIN" : offDiff < 0 ? "AWAY_WIN" : "TIE";

  // ¿Acertó quién ganó o si fue empate en el tiempo de juego?
  const hitBaseOutcome = predBaseOutcome === offBaseOutcome;

  // ¿Acertó la diferencia de goles?
  const hitDiff = predDiff === offDiff;

  // ¿Acertó los goles exactos?
  const hitExactScores =
    predHomeScore === offHomeScore && predAwayScore === offAwayScore;

  // 🏆 APLICAMOS LA JERARQUÍA JUSTA (El marcador manda)

  if (hitExactScores) {
    // 🎉 ¡PLENO! Le atinó al marcador. Se lleva todos los puntos, sin importar los penaltis.
    return config.exact_score; // +5 Puntos
  } else if (hitBaseOutcome && hitDiff) {
    // ⭐ DIFERENCIA: Le atinó a la diferencia de gol y al ganador/empate en cancha.
    return config.goal_diff; // +3 Puntos
  } else if (hitBaseOutcome) {
    // ✅ GANADOR: Solo le atinó a quién ganó en los 90/120 mins.
    return config.winner_only; // +1 Punto
  }

  // Fallo total en el marcador
  return 0;
};

/**
 * 🏆 MOTOR DE GRUPOS: Calcula los bonos por acertar los clasificados de un grupo
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

  // 🥇 REY DE GRUPO (+10)
  if (predFirstId === offFirstId && predSecondId === offSecondId) {
    return { points: config.group_perfect || 0, type: "PERFECT" };
  }

  // 🥈 CLASIFICADOS INV (+5)
  if (predFirstId === offSecondId && predSecondId === offFirstId) {
    return { points: config.group_inverse || 0, type: "INVERSE" };
  }

  // 🥉 1 ACIERTO (+2)
  let hits = 0;
  if (predFirstId === offFirstId || predFirstId === offSecondId) hits++;
  if (predSecondId === offFirstId || predSecondId === offSecondId) hits++;

  if (hits === 1) {
    return { points: config.group_single || 0, type: "SINGLE" };
  }

  // ❌ NADA
  return { points: 0, type: "NONE" };
};
