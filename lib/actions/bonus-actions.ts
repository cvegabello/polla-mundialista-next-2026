"use server";

import { createClient } from "@/utils/supabase/server";
import { calculateGroupBonusPoints, ScoreConfig } from "@/utils/points-engine";
import { calculateStandings } from "@/utils/standings";

export const evaluateGroupBonusesAction = async (
  groupId: string,
  groupMatches: any[],
  officialFirstId: string,
  officialSecondId: string,
) => {
  try {
    const supabase = await createClient();

    const { data: configData } = await supabase
      .from("score_configs")
      .select("*")
      .limit(1)
      .single();

    if (!configData) throw new Error("No se encontró configuración de puntos");

    const matchIds = groupMatches.map((m) => m.id);
    const { data: allPredictions, error: predError } = await supabase
      .from("predictions")
      .select("user_id, match_id, pred_home, pred_away, predicted_winner")
      .in("match_id", matchIds);

    if (predError)
      console.error("❌ Error consultando predicciones:", predError);

    if (!allPredictions || allPredictions.length === 0) {
      return { success: true, processed: 0 };
    }

    const predictionsByUser = allPredictions.reduce((acc: any, pred) => {
      if (!acc[pred.user_id]) acc[pred.user_id] = [];
      acc[pred.user_id].push(pred);
      return acc;
    }, {});

    const userIds = Object.keys(predictionsByUser);

    const bonusUpdates = [];

    for (const userId of userIds) {
      const userPreds = predictionsByUser[userId];
      const simulatedMatches = groupMatches.map((m) => {
        const pred = userPreds.find((p: any) => p.match_id === m.id);
        return {
          ...m,
          home_score: pred?.pred_home ?? null,
          away_score: pred?.pred_away ?? null,
          winner_id: pred?.predicted_winner ?? null,
        };
      });

      const userTable = calculateStandings(simulatedMatches, "es");
      const predFirstId = userTable[0]?.teamId;
      const predSecondId = userTable[1]?.teamId;

      const { points, type } = calculateGroupBonusPoints(
        predFirstId,
        predSecondId,
        officialFirstId,
        officialSecondId,
        configData as ScoreConfig,
      );

      const bonusType = `GROUP_${groupId}`;

      bonusUpdates.push({
        user_id: userId,
        bonus_type: bonusType,
        points_won: points,
        target_team_1: predFirstId || null,
        target_team_2: predSecondId || null,
      });
    }

    const { error: upsertError } = await supabase
      .from("bonus_points")
      .upsert(bonusUpdates, { onConflict: "user_id, bonus_type" });

    if (upsertError) {
      console.error("❌ ERROR EN UPSERT DE BD:", upsertError);
      throw upsertError;
    }

    return { success: true, processed: bonusUpdates.length };
  } catch (error) {
    console.error(`❌ Error calculando bonos del Grupo ${groupId}:`, error);
    throw error;
  }
};
