"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
      team_id: row.teamId,
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

export async function submitPredictionsAction(
  userId: string,
  phaseColumn: string = "sub_date_groups", // 👈 Por defecto asume grupos, pero es dinámico
) {
  const supabase = await createClient();
  try {
    const submissionDate = new Date().toISOString();

    // 1. Guardamos la fecha en la columna exacta de la fase correspondiente
    const { error } = await supabase
      .from("profiles")
      .update({ [phaseColumn]: submissionDate })
      .eq("id", userId);

    if (error) throw error;

    // 2. Actualizamos la cookie para que el frontend sepa que ya se bloqueó esa fase
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("polla_session");

    if (sessionCookie) {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
      sessionData[phaseColumn] = submissionDate; // Inyectamos la nueva fecha dinámicamente

      cookieStore.set(
        "polla_session",
        encodeURIComponent(JSON.stringify(sessionData)),
        {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 días
          sameSite: "lax",
        },
      );
    }

    revalidatePath("/", "layout");
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

// 👇 LA BALA DE PLATA APLICADA AQUÍ
export async function saveKnockoutTeamsAction(
  userId: string,
  resolvedMatches: any[],
) {
  const supabase = await createClient();

  try {
    // 🚀 TRADUCTOR: Buscamos el mapa de IDs físicos
    const { data: matchesMap } = await supabase
      .from("matches")
      .select("id, match_number");

    const getRealId = (mId: any) => {
      const found = matchesMap?.find(
        (m) =>
          m.match_number?.toString() === mId?.toString() ||
          m.id?.toString() === mId?.toString(),
      );
      return found ? found.id : mId;
    };

    const upsertData = resolvedMatches.map((match) => ({
      user_id: userId,
      match_id: getRealId(match.id), // 👈 Guardamos con el ID físico real
      predicted_home_team: match.home?.id || null,
      predicted_away_team: match.away?.id || null,
    }));

    const validData = upsertData.filter(
      (m) => m.predicted_home_team !== null && m.predicted_away_team !== null,
    );

    if (validData.length === 0) return { success: true };

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

// 👇 LA BALA DE PLATA APLICADA AQUÍ TAMBIÉN
export async function saveKnockoutPredictionAction(
  userId: string,
  matchId: string | number,
  homeScore: number,
  awayScore: number,
  winnerId: string,
) {
  const supabase = await createClient();
  try {
    // 🚀 TRADUCTOR: Buscamos el ID real de este partido
    const { data: realMatch } = await supabase
      .from("matches")
      .select("id")
      .or(`id.eq.${matchId},match_number.eq.${matchId}`)
      .single();

    const physicalId = realMatch ? realMatch.id : parseInt(matchId.toString());

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: userId,
        match_id: physicalId, // 👈 Guardamos con el ID físico real
        pred_home: homeScore,
        pred_away: awayScore,
        predicted_winner: winnerId,
      },
      { onConflict: "user_id, match_id" },
    );

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 👇 Y EN EL GUARDADO MASIVO DE GRUPOS
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
    // 🚀 TRADUCTOR: Mapa de IDs
    const { data: matchesMap } = await supabase
      .from("matches")
      .select("id, match_number");

    const getRealId = (mId: any) => {
      const found = matchesMap?.find(
        (m) =>
          m.match_number?.toString() === mId?.toString() ||
          m.id?.toString() === mId?.toString(),
      );
      return found ? found.id : mId;
    };

    const rowsToUpsert = matchesData.map((match) => ({
      user_id: userId,
      match_id: getRealId(match.matchId), // 👈 Guardamos con el ID físico real
      pred_home: match.hScore,
      pred_away: match.aScore,
    }));

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
