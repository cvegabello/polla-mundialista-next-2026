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
  phaseColumn: string = "sub_date_groups",
) {
  const supabase = await createClient();
  try {
    const submissionDate = new Date().toISOString();

    const { error } = await supabase
      .from("profiles")
      .update({ [phaseColumn]: submissionDate })
      .eq("id", userId);

    if (error) throw error;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("polla_session");

    if (sessionCookie) {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
      sessionData[phaseColumn] = submissionDate;

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

export async function saveKnockoutTeamsAction(
  userId: string,
  resolvedMatches: any[],
) {
  const supabase = await createClient();

  try {
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
      match_id: getRealId(match.id),
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

export async function saveKnockoutPredictionAction(
  userId: string,
  matchId: string | number,
  homeScore: number,
  awayScore: number,
  winnerId: string,
) {
  const supabase = await createClient();
  try {
    const { data: realMatch } = await supabase
      .from("matches")
      .select("id")
      .or(`id.eq.${matchId},match_number.eq.${matchId}`)
      .single();

    const physicalId = realMatch ? realMatch.id : parseInt(matchId.toString());

    const { error } = await supabase.from("predictions").upsert(
      {
        user_id: userId,
        match_id: physicalId,
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
      match_id: getRealId(match.matchId),
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

export async function submitKnockoutPhaseAction(userId: string, phase: string) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  const columnToUpdate = `sub_date_${phase}`;
  const now = new Date().toISOString();

  try {
    const { error } = await supabase
      .from("profiles")
      .update({ [columnToUpdate]: now })
      .eq("id", userId);

    if (error) throw error;

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("polla_session");

    if (sessionCookie) {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
      sessionData[columnToUpdate] = now;

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

    return { success: true };
  } catch (error: any) {
    console.error(`Error sellando la fase ${phase}:`, error);
    return { success: false, error: error.message };
  }
}

export async function getVarReportDataAction(userId: string) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  try {
    const { data: currentUser, error: userErr } = await supabase
      .from("profiles")
      .select("polla_id")
      .eq("id", userId)
      .single();

    if (userErr || !currentUser)
      throw new Error("No se pudo identificar la polla.");
    const pollaId = currentUser.polla_id;

    // 🚀 NUEVO: Buscar el nombre de la polla (grupo)
    const { data: groupData } = await supabase
      .from("pollas")
      .select("name")
      .eq("id", pollaId)
      .single();
    const pollaName = groupData?.name || "GRUPO"; // Fallback por si acaso

    const { data: scoreConfig } = await supabase
      .from("score_configs")
      .select("*")
      .eq("polla_id", pollaId)
      .single();

    const { data: participants, error: partErr } = await supabase
      .from("profiles")
      .select("id, username, sub_date_groups")
      .eq("polla_id", pollaId)
      .not("sub_date_groups", "is", null);

    if (partErr) throw partErr;

    const { data: matches, error: matchErr } = await supabase
      .from("matches")
      .select(
        `
        id, match_number, match_date, home_score, away_score, status,
        home:teams!home_team_id(id, name_es, name_en, flag_code),
        away:teams!away_team_id(id, name_es, name_en, flag_code)
      `,
      )
      .order("match_date", { ascending: true });

    if (matchErr) throw matchErr;

    let predictions: any[] = [];
    // 🚀 NUEVO: Array para guardar los bonos
    let bonusPoints: any[] = [];

    if (participants && participants.length > 0) {
      const participantIds = participants.map((p) => p.id);
      const { data: preds, error: predErr } = await supabase
        .from("predictions")
        .select("user_id, match_id, pred_home, pred_away, points_won")
        .in("user_id", participantIds);

      if (predErr) throw predErr;
      predictions = preds || [];

      // 🚀 NUEVO: Traemos los bonos solo de los participantes de esta polla
      const { data: bonuses, error: bonusErr } = await supabase
        .from("bonus_points")
        .select("user_id, points_won, bonus_type")
        .in("user_id", participantIds);

      if (bonusErr) {
        console.error("Error trayendo bonos", bonusErr);
      } else {
        bonusPoints = bonuses || [];
      }
    }

    return {
      success: true,
      data: {
        pollaName,
        participants: participants || [],
        matches: matches || [],
        predictions,
        scoreConfig,
        bonusPoints, // 🚀 NUEVO: Retornamos los bonos al Frontend
      },
    };
  } catch (error: any) {
    console.error("❌ Error en getVarReportDataAction:", error.message);
    return { success: false, error: error.message };
  }
}
