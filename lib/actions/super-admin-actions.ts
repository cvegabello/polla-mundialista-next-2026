"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateMatchPoints, ScoreConfig } from "@/utils/points-engine";
import { calculateStandings } from "@/utils/standings";
import { evaluateGroupBonusesAction } from "./bonus-actions";

export const saveOfficialScoreAction = async (
  matchId: number,
  homeScore: any, // 👈 1. Cambiamos a 'any' para atrapar el texto vacío ("")
  awayScore: any, // 👈 1. Cambiamos a 'any'
  winnerId?: string | null,
) => {
  // 📸 CÁMARAS DE SEGURIDAD AQUÍ:
  console.log("=== DEBUG SUPER ADMIN: INICIO DE GUARDADO ===");
  console.log("ID del Partido:", matchId);
  console.log("homeScore crudo:", homeScore, "| Tipo:", typeof homeScore);
  console.log("awayScore crudo:", awayScore, "| Tipo:", typeof awayScore);
  try {
    const supabase = await createClient();

    // 🛡️ 2. EL FILTRO QUIRÚRGICO: Si es "", lo vuelve null. Si es número, lo asegura como Number.
    const cleanHome =
      homeScore === "" || homeScore === null || homeScore === undefined
        ? null
        : Number(homeScore);
    const cleanAway =
      awayScore === "" || awayScore === null || awayScore === undefined
        ? null
        : Number(awayScore);

    // 📸 SEGUNDA CÁMARA:
    console.log(
      "Datos limpios listos para BD -> cleanHome:",
      cleanHome,
      "| cleanAway:",
      cleanAway,
    );
    console.log("=============================================");

    // 1. Guardamos la verdad absoluta en la tabla 'matches' usando los datos limpios
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: cleanHome, // 👈 Usamos la variable limpia
        away_score: cleanAway, // 👈 Usamos la variable limpia
        winner_id: winnerId,
      })
      .eq("id", matchId);

    if (matchError) throw matchError;

    // 🏆 2. LA MAGIA: Traemos la configuración de puntos
    const { data: configData } = await supabase
      .from("score_configs")
      .select("*")
      .limit(1)
      .single();

    if (configData) {
      // 3. Traemos TODAS las predicciones de este partido (sin discriminar a los mirones)
      const { data: predictions } = await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", matchId);

      if (predictions && predictions.length > 0) {
        // 4. Pasamos cada predicción válida por el Motor de Puntos
        const updates = predictions.map((pred) => {
          const points = calculateMatchPoints(
            pred.pred_home,
            pred.pred_away,
            pred.predicted_winner,
            cleanHome,
            cleanAway,
            winnerId,
            configData as ScoreConfig, // o el tipo que tenga definido
          );

          return {
            ...pred,
            points_won: points,
          };
        });

        // 5. Guardado Masivo (Bulk Upsert)
        const { error: upsertError } = await supabase
          .from("predictions")
          .upsert(updates);

        if (upsertError) {
          console.error("Error actualizando puntos:", upsertError);
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
