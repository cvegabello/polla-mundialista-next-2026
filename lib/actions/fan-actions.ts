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

// 🚀 NUEVA FUNCIÓN: Para traer los equipos y llenar el combobox del Modal
export async function getAllTeamsAction() {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name_es, name_en, flag_code")
    .order("name_es", { ascending: true });

  if (error) {
    console.error("Error trayendo equipos:", error);
    return [];
  }
  return data;
}

// 🚀 FUNCIÓN ACTUALIZADA: Ahora recibe el championId y lo guarda en profiles
export async function submitPredictionsAction(
  userId: string,
  phaseColumn: string = "sub_date_groups",
  championId?: any, // 👈 NUEVO: Recibimos el ID del campeón
) {
  const { createClient } = await import("@/utils/supabase/server");
  const supabase = await createClient();

  try {
    const submissionDate = new Date().toISOString();

    // 1. Preparamos la data a actualizar
    const updateData: any = { [phaseColumn]: submissionDate };

    // Si estamos cerrando grupos y nos mandaron un campeón, lo guardamos en champion_pick_1
    if (phaseColumn === "sub_date_groups" && championId) {
      updateData.champion_pick_1 = championId;
    }

    // Si estamos enviando la primera fase de eliminatorias (r32)
    else if (phaseColumn === "sub_date_r32" && championId) {
      updateData.champion_pick_2 = championId;
    }

    // 2. Guardamos todo en la base de datos
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId);

    if (error) throw error;

    // 3. Actualizamos la galleta
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("polla_session");

    if (sessionCookie) {
      const sessionData = JSON.parse(decodeURIComponent(sessionCookie.value));
      sessionData[phaseColumn] = submissionDate;

      // Si quiere también guardamos el pick en la sesión por si acaso
      if (championId) sessionData.champion_pick_1 = championId;

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

    // 🚀 MAGIA PURA: Obligamos a Next.js a refrescar el dashboard con el candado cerrado
    revalidatePath("/", "layout");

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
      .select("polla_id, champion_pick_1, champion_pick_2")
      .eq("id", userId)
      .single();

    if (userErr || !currentUser)
      throw new Error("No se pudo identificar la polla.");
    const pollaId = currentUser.polla_id;

    const { data: groupData } = await supabase
      .from("pollas")
      .select("name")
      .eq("id", pollaId)
      .single();
    const pollaName = groupData?.name || "GRUPO";

    const { data: scoreConfig } = await supabase
      .from("score_configs")
      .select("*")
      .eq("polla_id", pollaId)
      .single();

    // 🚀 CAMBIO 1: Traemos los picks de todos los participantes
    const { data: participants, error: partErr } = await supabase
      .from("profiles")
      .select("id, username, sub_date_groups, champion_pick_1, champion_pick_2")
      .eq("polla_id", pollaId)
      .not("sub_date_groups", "is", null);

    if (partErr) throw partErr;

    const { data: matches, error: matchErr } = await supabase
      .from("matches")
      .select(
        `
        id, match_number, match_date, home_score, away_score, status, winner_id,
        home:teams!home_team_id(id, name_es, name_en, flag_code),
        away:teams!away_team_id(id, name_es, name_en, flag_code)
      `,
      )
      .order("match_date", { ascending: true });

    if (matchErr) throw matchErr;

    let predictions: any[] = [];
    let bonusPoints: any[] = [];

    if (participants && participants.length > 0) {
      const participantIds = participants.map((p) => p.id);

      const { data: preds } = await supabase
        .from("predictions")
        .select("user_id, match_id, pred_home, pred_away, points_won")
        .in("user_id", participantIds);
      predictions = preds || [];

      const { data: bonuses } = await supabase
        .from("bonus_points")
        .select("user_id, points_won, bonus_type")
        .in("user_id", participantIds);
      bonusPoints = bonuses || [];
    }

    // 🏆 CAMBIO 2: Buscamos TODOS los equipos campeones elegidos por el grupo
    const allChampIds = new Set();
    participants?.forEach((p) => {
      if (p.champion_pick_1) allChampIds.add(p.champion_pick_1);
      if (p.champion_pick_2) allChampIds.add(p.champion_pick_2);
    });

    let champTeamsMap: any = {};
    if (allChampIds.size > 0) {
      const { data: tData } = await supabase
        .from("teams")
        .select("id, name_es, name_en, flag_code")
        .in("id", Array.from(allChampIds));

      tData?.forEach((t) => {
        champTeamsMap[t.id] = t;
      });
    }

    const getFlagUrl = (code?: string) =>
      code && !code.includes("_rep_")
        ? `https://flagcdn.com/w80/${code.substring(0, 2)}.png`
        : null;

    // 🏆 ¡MAGIA AUTOMÁTICA! Buscamos el partido 104 (La Gran Final) y sacamos a su ganador
    const finalMatch = matches?.find((m: any) => m.match_number === 104);
    const officialWorldChampionId = finalMatch?.winner_id || null;

    // 🚀 CAMBIO 3: Enriquecemos a cada participante con sus campeones y puntos
    const enrichedParticipants = participants?.map((p) => {
      const t1 = p.champion_pick_1 ? champTeamsMap[p.champion_pick_1] : null;
      const t2 = p.champion_pick_2 ? champTeamsMap[p.champion_pick_2] : null;

      let c1Pts = 0;
      let c2Pts = 0;

      if (
        officialWorldChampionId &&
        p.champion_pick_1 === officialWorldChampionId
      ) {
        c1Pts = scoreConfig?.champ_initial || 0;
      }
      if (
        officialWorldChampionId &&
        p.champion_pick_2 === officialWorldChampionId
      ) {
        c2Pts = scoreConfig?.champ_final || 0;
      }

      return {
        ...p,
        champion1: t1 ? { ...t1, flag_url: getFlagUrl(t1.flag_code) } : null,
        champion2: t2 ? { ...t2, flag_url: getFlagUrl(t2.flag_code) } : null,
        champPts: c1Pts + c2Pts,
      };
    });

    const currentUserPick1 = currentUser.champion_pick_1
      ? champTeamsMap[currentUser.champion_pick_1]
      : null;
    const currentUserPick2 = currentUser.champion_pick_2
      ? champTeamsMap[currentUser.champion_pick_2]
      : null;

    let pointsChampion1 = 0;
    let pointsChampion2 = 0;
    if (
      officialWorldChampionId &&
      currentUser.champion_pick_1 === officialWorldChampionId
    )
      pointsChampion1 = scoreConfig?.champ_initial || 0;
    if (
      officialWorldChampionId &&
      currentUser.champion_pick_2 === officialWorldChampionId
    )
      pointsChampion2 = scoreConfig?.champ_final || 0;

    const championPicks = {
      champion1: currentUserPick1
        ? {
            ...currentUserPick1,
            name: currentUserPick1.name_es,
            flag_url: getFlagUrl(currentUserPick1.flag_code),
          }
        : null,
      champion2: currentUserPick2
        ? {
            ...currentUserPick2,
            name: currentUserPick2.name_es,
            flag_url: getFlagUrl(currentUserPick2.flag_code),
          }
        : null,
      total_earned_points: pointsChampion1 + pointsChampion2,
    };

    return {
      success: true,
      data: {
        pollaName,
        participants: enrichedParticipants || [], // 👈 Va enriquecido con banderas
        matches: matches || [],
        predictions,
        scoreConfig,
        bonusPoints,
        championPicks,
      },
    };
  } catch (error: any) {
    console.error("❌ Error en getVarReportDataAction:", error.message);
    return { success: false, error: error.message };
  }
}
