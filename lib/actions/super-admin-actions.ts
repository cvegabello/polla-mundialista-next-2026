"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { calculateMatchPoints, ScoreConfig } from "@/utils/points-engine";
import { calculateStandings } from "@/utils/standings";
import { evaluateGroupBonusesAction } from "./bonus-actions";

import {
  getUserStandingsAction,
  saveKnockoutTeamsAction,
} from "@/lib/actions/fan-actions";
import { resolveBracketMatches } from "@/utils/bracket-resolver";
import {
  R32_MATCHUPS,
  R16_MATCHUPS,
  QF_MATCHUPS,
  SF_MATCHUPS,
  F_MATCHUPS,
} from "@/components/constants/matchups";

const ALL_MATCHUPS = [
  ...R32_MATCHUPS,
  ...R16_MATCHUPS,
  ...QF_MATCHUPS,
  ...SF_MATCHUPS,
  ...F_MATCHUPS,
];

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
// 🔄 Sincronizador de Llaves (Bracket) Blindado
export const syncBracketTeamsAction = async (
  updates: {
    matchId: number;
    homeTeamId: string | null;
    awayTeamId: string | null;
  }[],
) => {
  console.log("=== 📡 SERVIDOR: RECIBIENDO UPDATES DEL BRACKET ===");
  console.log("Datos recibidos:", JSON.stringify(updates, null, 2));

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

        if (error) {
          console.error(
            `❌ Error BD al actualizar partido ${update.matchId}:`,
            error,
          );
          throw error;
        } else {
          console.log(
            `✅ BD Actualizada -> Partido ${update.matchId}: Local [${update.homeTeamId}] - Visitante [${update.awayTeamId}]`,
          );
        }
      }
    }

    revalidatePath("/", "layout");
    console.log("=== 🏁 SERVIDOR: GUARDADO COMPLETADO ===");
    return { success: true };
  } catch (error) {
    console.error("❌ Error sincronizando los equipos de las llaves:", error);
    throw error;
  }
};

// ☢️ RESET NUCLEAR: Simula que el torneo no ha empezado
export const resetOfficialDataAction = async () => {
  console.log("=== ☢️ INICIANDO RESET NUCLEAR DE RESULTADOS OFICIALES ===");

  try {
    const supabase = await createClient();

    // 1. Limpiar todos los marcadores oficiales y el ganador
    const { error: matchesError } = await supabase
      .from("matches")
      .update({
        home_score: null,
        away_score: null,
        winner_id: null,
      })
      .not("id", "is", null); // Truco para afectar todas las filas

    if (matchesError) throw matchesError;

    // 2. Limpiar los equipos clasificados a la fase final (Partidos 73 en adelante)
    const { error: knockoutError } = await supabase
      .from("matches")
      .update({
        home_team_id: null,
        away_team_id: null,
      })
      .gt("match_number", 72);

    if (knockoutError) throw knockoutError;

    // 3. Vaciar completamente la tabla de bonos
    const { error: bonusError } = await supabase
      .from("bonus_points")
      .delete()
      .not("id", "is", null);

    if (bonusError) throw bonusError;

    // 4. Limpiar los puntos ganados (Pero NO borramos los pronósticos)
    const { error: predError } = await supabase
      .from("predictions")
      .update({ points_won: null })
      .not("id", "is", null);

    if (predError) throw predError;

    // 5. Dejar a todos los usuarios con 0 puntos en la tabla general
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ total_points: 0 })
      .not("id", "is", null);

    if (profileError) throw profileError;

    revalidatePath("/", "layout");
    console.log("=== ☢️ RESET COMPLETADO CON ÉXITO ===");
    return { success: true };
  } catch (error) {
    console.error("❌ Error en el reset nuclear:", error);
    return { success: false, error };
  }
};
// ==========================================
// 👥 MODAL DE GESTIÓN DE USUARIOS
// ==========================================

// 1. Traer todos los usuarios del sistema
export const getSystemUsersAction = async () => {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      // 🚀 ¡AQUÍ ESTÁ LA MAGIA! Si falta 'polla_id' aquí, el filtro llega ciego al frontend
      .select("id, username, sub_date_groups, role, polla_id")
      .order("username", { ascending: true });

    if (error) throw error;

    // Filtramos para no mostrar superadmins
    const fans = data.filter((u) => u.role !== "superadmin");
    return { success: true, data: fans };
  } catch (error) {
    console.error("❌ Error obteniendo usuarios:", error);
    return { success: false, data: [] };
  }
};
// 2. Devolver a Borrador (Quitar candado)
export const revertUserToDraftAction = async (userId: string) => {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        sub_date_groups: null,
        champion_pick_1: null, // Borramos su campeón para que lo vuelva a elegir
      })
      .eq("id", userId);

    if (error) throw error;

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("❌ Error abriendo el candado del usuario:", error);
    return { success: false };
  }
};

// ==========================================
// 🧙‍♂️ BOTÓN MÁGICO: Recalcular llaves de fans
// ==========================================
export const forceRecalculateAllBracketsAction = async () => {
  console.log("=== 🧙‍♂️ INICIANDO RECALCULO MASIVO DE LLAVES ===");
  try {
    const supabase = await createClient();

    // 1. Traer todos los fans (Excluimos a los superadmins)
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, username")
      .neq("role", "superadmin");

    if (error) throw error;

    let successCount = 0;

    // 2. Iterar sobre cada usuario y calcularle la llave
    for (const user of users) {
      try {
        console.log(`⏳ Procesando usuario: ${user.username}...`);

        // Traemos sus posiciones guardadas (como si el fan acabara de guardar)
        const standings = await getUserStandingsAction(user.id);

        // Si tiene posiciones (es decir, ya llenó su fase de grupos)
        if (standings && standings.length > 0) {
          // Pasamos sus datos por el motor matemático
          // Nota: pasamos {} en knockoutWinners porque solo nos interesa sembrar los equipos base
          const resolvedMatches = resolveBracketMatches(
            standings,
            {},
            ALL_MATCHUPS,
          );

          // Lo clavamos en la base de datos de forma invisible
          await saveKnockoutTeamsAction(user.id, resolvedMatches);
          successCount++;
          console.log(`✅ Llaves de ${user.username} actualizadas.`);
        } else {
          console.log(`⏭️ ${user.username} no tiene grupos llenos, saltando.`);
        }
      } catch (userError) {
        console.error(`❌ Error calculando a ${user.username}:`, userError);
      }
    }

    console.log(
      `=== 🧙‍♂️ RECALCULO COMPLETADO: ${successCount} usuarios actualizados ===`,
    );
    return { success: true, count: successCount };
  } catch (error) {
    console.error("❌ Error en el recálculo masivo:", error);
    return { success: false, error };
  }
};

// Reemplace la función anterior por esta:
export async function createPollaOnly(pollaName: string) {
  try {
    const { createClient } = await import("@/utils/supabase/server");
    const supabase = await createClient();

    // Generar código mágico
    const prefix = pollaName
      .substring(0, 6)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    const inviteCode = `${prefix}-${random}`;

    // Solo creamos la polla, no creamos ningún usuario aquí
    const { data: pollaData, error: pollaError } = await supabase
      .from("pollas")
      .insert([{ name: pollaName, invite_code: inviteCode }])
      .select()
      .single();

    if (pollaError)
      throw new Error("Error al crear la polla: " + pollaError.message);

    return { success: true, inviteCode, pollaName };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
