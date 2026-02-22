"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveGroupStandingsAction(
  userId: string,
  groupId: string,
  standings: any[],
) {
  const supabase = await createClient();
  try {
    const rowsToUpsert = standings.map((row) => ({
      user_id: userId,
      group_id: groupId,
      team_id: row.teamId, // 👈 Si esto es undefined, sale el error que tiene ahora
      position: row.pos,
      played: row.played || 0,
      won: row.won || 0,
      tied: row.tied || 0,
      lost: row.lost || 0,
      points: row.pts,
      gf: row.gf,
      gc: row.gc,
      dg: row.dg,
      updated_at: new Date().toISOString(),
    }));

    // Verificación rápida en su consola de servidor
    // console.log("💾 Intentando guardar team_id:", rowsToUpsert[0]?.team_id);

    const { error } = await supabase
      .from("user_group_standings")
      .upsert(rowsToUpsert, { onConflict: "user_id,team_id" });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("❌ Error Supabase:", error.message);
    return { success: false, error: error.message };
  }
}

// Su función de submit sigue igual de melo
export async function submitPredictionsAction(userId: string) {
  const supabase = await createClient();
  try {
    const submissionDate = new Date().toISOString();
    const { error } = await supabase
      .from("profiles")
      .update({ submission_date: submissionDate })
      .eq("id", userId);

    if (error) throw error;
    revalidatePath("/dashboard");
    return { success: true, date: submissionDate };
  } catch (error) {
    console.error("Error en submitPredictionsAction:", error);
    return { success: false };
  }
}

export async function getUserStandingsAction(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_group_standings")
    .select(
      `
      *,
      team:teams (id, name_es, name_en, flag_code)
    `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error trayendo posiciones:", error);
    return [];
  }
  return data;
}

// 👇 NUEVA FUNCIÓN: Guarda los equipos clasificados en la tabla predictions
export async function saveKnockoutTeamsAction(
  userId: string,
  resolvedMatches: any[],
) {
  const supabase = await createClient();

  try {
    // 1. Mapeamos los partidos resueltos al formato de la tabla predictions
    const upsertData = resolvedMatches.map((match) => ({
      user_id: userId,
      match_id: match.id, // Ej: "73", "74", "75"...
      predicted_home_team: match.home?.id || null, // El ID del equipo local que calculó el algoritmo
      predicted_away_team: match.away?.id || null, // El ID del equipo visitante que calculó el algoritmo
    }));

    // 2. Filtramos para no intentar guardar partidos donde falten IDs de equipos
    // (Por si el usuario no ha terminado los grupos completos)
    const validData = upsertData.filter(
      (m) => m.predicted_home_team !== null && m.predicted_away_team !== null,
    );

    if (validData.length === 0) {
      return {
        success: true,
        message: "No hay llaves completas para guardar.",
      };
    }

    // 3. Upsert en la base de datos:
    // Si ya existía el pronóstico para ese partido (ej. 73), le actualiza los equipos.
    // Si no existía, crea la fila.
    const { error } = await supabase
      .from("predictions")
      .upsert(validData, { onConflict: "user_id, match_id" });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error guardando los equipos del bracket:", error.message);
    return { success: false, error: error.message };
  }
}

// 👇 NUEVA FUNCIÓN: Guarda los goles y el ganador del bracket
export async function saveKnockoutPredictionAction(
  userId: string,
  matchId: string | number,
  homeScore: number,
  awayScore: number,
  winnerId: string,
) {
  // 🕵️‍♂️ RASTREADOR 3: Verificamos qué llega al servidor
  console.log("🛠️ 3. SERVIDOR RECIBIÓ:", {
    userId,
    matchId,
    homeScore,
    awayScore,
    winnerId,
  });

  const supabase = await createClient();
  try {
    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: userId,
        match_id: parseInt(matchId.toString()),
        pred_home: homeScore,
        pred_away: awayScore,
        predicted_winner: winnerId,
      },
      { onConflict: "user_id, match_id" },
    );

    if (error) {
      // 🕵️‍♂️ RASTREADOR 4: El error exacto de la base de datos
      console.error("❌ 4. ERROR SUPABASE:", error);
      throw error;
    }

    console.log("💾 5. GUARDADO EXITOSO EN BD");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 👇 NUEVA FUNCIÓN: Guardado Masivo de Grupo (Server Action)
export async function saveGroupBulkPredictionsAction(
  userId: string,
  matchesData: {
    matchId: number;
    hScore: number | null;
    aScore: number | null;
  }[],
) {
  const supabase = await createClient();
  try {
    // 1. Mapeamos los datos al formato exacto de tu tabla en Supabase
    const rowsToUpsert = matchesData.map((match) => ({
      user_id: userId,
      match_id: match.matchId,
      pred_home: match.hScore,
      pred_away: match.aScore,
    }));

    // 2. Le pasamos todo el Array a Supabase. ¡Él hace el guardado masivo en 1 milisegundo!
    const { error } = await supabase
      .from("predictions")
      .upsert(rowsToUpsert, { onConflict: "user_id, match_id" });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error en guardado masivo:", error.message);
    return { success: false, error: error.message };
  }
}
