"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateMatchPoints, ScoreConfig } from "@/utils/points-engine";
import { calculateStandings } from "@/utils/standings";
import { evaluateGroupBonusesAction } from "./bonus-actions";

export const saveOfficialScoreAction = async (
  matchId: number,
  homeScore: number | null,
  awayScore: number | null,
  winnerId?: string | null,
) => {
  try {
    const supabase = await createClient();

    // 1. Guardamos la verdad absoluta en la tabla 'matches' (Como lo teníamos)
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        winner_id: winnerId,
      })
      .eq("id", matchId);

    if (matchError) throw matchError;

    // 🏆 2. LA MAGIA: Traemos la configuración de puntos
    // (Por ahora traemos la primera que encuentre, luego lo amarramos a polla_id si tiene varias)
    const { data: configData } = await supabase
      .from("score_configs")
      .select("*")
      .limit(1)
      .single();

    if (configData) {
      // 3. Traemos TODAS las predicciones que los fans hicieron para este partido específico
      const { data: predictions } = await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", matchId);

      if (predictions && predictions.length > 0) {
        // 4. Pasamos cada predicción por el Motor de Puntos
        const updates = predictions.map((pred) => {
          const points = calculateMatchPoints(
            pred.pred_home,
            pred.pred_away,
            pred.predicted_winner,
            homeScore,
            awayScore,
            winnerId,
            configData as ScoreConfig,
          );

          // Armamos el objeto de actualización
          return {
            ...pred, // Dejamos el id, user_id y los pronósticos intactos
            points_won: points, // 👈 ¡Sobreescribimos con el nuevo puntaje calculado!
          };
        });

        // 5. Guardado Masivo (Bulk Upsert): Actualiza miles de registros en 1 segundo
        const { error: upsertError } = await supabase
          .from("predictions")
          .upsert(updates);

        if (upsertError) {
          console.error(
            "Error actualizando los puntos de las predicciones:",
            upsertError,
          );
        }
      }
    }

    // 🌟 EL RADAR DE GRUPOS COMPLETADOS
    const { data: currentMatch } = await supabase
      .from("matches")
      .select("group_id")
      .eq("id", matchId)
      .single();

    if (currentMatch?.group_id && currentMatch.group_id !== "FI") {
      // 1. Volvemos al select normal que sabemos que NUNCA falla
      const { data: groupMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("group_id", currentMatch.group_id);

      if (groupMatches && groupMatches.length > 0) {
        const isGroupComplete = groupMatches.every(
          (m) => m.home_score !== null && m.away_score !== null,
        );

        if (isGroupComplete) {
          const officialTable = calculateStandings(groupMatches, "es");

          // 👇 LA CORRECCIÓN DE ORO: teamId con la "I" mayúscula
          const firstId = officialTable[0]?.teamId;
          const secondId = officialTable[1]?.teamId;

          if (firstId && secondId) {
            await evaluateGroupBonusesAction(
              currentMatch.group_id,
              groupMatches,
              firstId,
              secondId,
            );
          }
        }
      }
    }

    // Limpiamos caché para que el Fan Dashboard vea todo instantáneamente
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error en saveOfficialScoreAction:", error);
    throw error;
  }
};

// Función para sincronizar los equipos de las llaves en la base de datos
export const syncBracketTeamsAction = async (
  updates: {
    matchId: number;
    homeTeamId: string | null;
    awayTeamId: string | null;
  }[],
) => {
  try {
    const supabase = await createClient();

    // Actualizamos cada partido que haya tenido un cambio de equipo
    for (const update of updates) {
      const { error } = await supabase
        .from("matches")
        .update({
          home_team_id: update.homeTeamId,
          away_team_id: update.awayTeamId,
        })
        .eq("id", update.matchId);

      if (error) throw error;
    }

    // Limpiamos el caché para que los fans vean los cambios al instante
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error sincronizando los equipos de las llaves:", error);
    throw error;
  }
};
