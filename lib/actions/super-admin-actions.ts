"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateMatchPoints, ScoreConfig } from "@/utils/points-engine";
import { calculateStandings } from "@/utils/standings";
import { evaluateGroupBonusesAction } from "./bonus-actions";

export const saveOfficialScoreAction = async (
  matchId: number,
  homeScore: any,
  awayScore: any,
  winnerId?: string | null,
) => {
  console.log("=== DEBUG SUPER ADMIN: INICIO DE GUARDADO ===");
  console.log("ID/MatchNumber recibido:", matchId);

  try {
    const supabase = await createClient();

    // 🛡️ 1. EL FILTRO QUIRÚRGICO
    const cleanHome =
      homeScore === "" || homeScore === null || homeScore === undefined
        ? null
        : Number(homeScore);
    const cleanAway =
      awayScore === "" || awayScore === null || awayScore === undefined
        ? null
        : Number(awayScore);

    // 🚀 2. LA BALA DE PLATA: Buscar el partido real
    const { data: realMatch, error: findError } = await supabase
      .from("matches")
      .select("id, group_id")
      .or(`id.eq.${matchId},match_number.eq.${matchId}`)
      .single();

    if (findError || !realMatch) {
      throw new Error("Partido no encontrado");
    }

    // 3. Guardamos la verdad absoluta
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: cleanHome,
        away_score: cleanAway,
        winner_id: winnerId,
      })
      .eq("id", realMatch.id);

    if (matchError) throw matchError;

    // 🏆 4. LA MAGIA DE PUNTOS INDIVIDUALES
    const { data: configData } = await supabase
      .from("score_configs")
      .select("*")
      .limit(1)
      .single();

    if (configData) {
      const { data: predictions } = await supabase
        .from("predictions")
        .select("*")
        .eq("match_id", realMatch.id);

      if (predictions && predictions.length > 0) {
        const updates = predictions.map((pred) => {
          const points = calculateMatchPoints(
            pred.pred_home,
            pred.pred_away,
            pred.predicted_winner,
            cleanHome,
            cleanAway,
            winnerId,
            configData as ScoreConfig,
          );

          return {
            ...pred,
            points_won: points,
          };
        });

        await supabase.from("predictions").upsert(updates);
      }
    }

    // 🌟 5. EL RADAR DE GRUPOS COMPLETADOS
    if (realMatch.group_id && realMatch.group_id !== "FI") {
      const { data: groupMatches } = await supabase
        .from("matches")
        .select("*")
        .eq("group_id", realMatch.group_id);

      if (groupMatches && groupMatches.length > 0) {
        const isGroupComplete = groupMatches.every(
          (m) => m.home_score !== null && m.away_score !== null,
        );

        if (isGroupComplete) {
          const officialTable = calculateStandings(groupMatches, "es");

          const firstId = officialTable[0]?.teamId;
          const secondId = officialTable[1]?.teamId;

          if (firstId && secondId) {
            // Evaluamos y guardamos bonos en la tabla 'bonus_points'
            await evaluateGroupBonusesAction(
              realMatch.group_id,
              groupMatches,
              firstId,
              secondId,
            );
          }
        }
      }
    }

    // 🚀🚀 6. LA GRAN SUMADORA: Actualizar 'total_points' en profiles 🚀🚀
    console.log("Calculando Gran Total para la tabla de posiciones...");

    // Traemos todos los puntos de partidos
    const { data: allPreds } = await supabase
      .from("predictions")
      .select("user_id, points_won")
      .not("points_won", "is", null);

    // Traemos todos los puntos de bonos
    const { data: allBonuses } = await supabase
      .from("bonus_points")
      .select("user_id, points_won")
      .not("points_won", "is", null);

    // Agrupamos la suma en un "diccionario" por usuario
    const userTotals: Record<string, number> = {};

    allPreds?.forEach((p) => {
      userTotals[p.user_id] =
        (userTotals[p.user_id] || 0) + (p.points_won || 0);
    });

    allBonuses?.forEach((b) => {
      userTotals[b.user_id] =
        (userTotals[b.user_id] || 0) + (b.points_won || 0);
    });

    // Actualizamos masivamente la tabla profiles
    const { data: allProfiles } = await supabase.from("profiles").select("id");

    if (allProfiles) {
      for (const profile of allProfiles) {
        const finalScore = userTotals[profile.id] || 0;
        await supabase
          .from("profiles")
          .update({ total_points: finalScore })
          .eq("id", profile.id);
      }
    }

    revalidatePath("/", "layout");
    console.log("=== GUARDADO Y PUNTOS CALCULADOS EXITOSAMENTE ===");
    return { success: true };
  } catch (error) {
    console.error("Error en saveOfficialScoreAction:", error);
    throw error;
  }
};

// 🔄 Sincronizador de Llaves (Bracket) Blindado
export const syncBracketTeamsAction = async (
  updates: {
    matchId: number;
    homeTeamId: string | null;
    awayTeamId: string | null;
  }[],
) => {
  try {
    const supabase = await createClient();

    for (const update of updates) {
      const { data: realMatch } = await supabase
        .from("matches")
        .select("id")
        .or(`id.eq.${update.matchId},match_number.eq.${update.matchId}`)
        .single();

      if (realMatch) {
        const { error } = await supabase
          .from("matches")
          .update({
            home_team_id: update.homeTeamId,
            away_team_id: update.awayTeamId,
          })
          .eq("id", realMatch.id);

        if (error) throw error;
      }
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error sincronizando los equipos de las llaves:", error);
    throw error;
  }
};
