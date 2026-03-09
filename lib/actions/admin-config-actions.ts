"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. Traer la configuración actual
export async function getGlobalConfigAction() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("global_config")
    .select("*")
    .single();
  if (error) {
    console.error("Error obteniendo config:", error);
    return null;
  }
  return data;
}

// 2. Traer config + Conteo de partidos jugados (USANDO MATCH_NUMBER ESTATICO) 🛡️
export async function getAdminPanelDataAction() {
  const supabase = await createClient();

  // A. Traemos los switches
  const { data: config } = await supabase
    .from("global_config")
    .select("*")
    .single();

  // B. Traemos TODOS los partidos, incluyendo el nuevo campo ESTATICO: match_number
  const { data: allMatches, error: matchError } = await supabase
    .from("matches")
    .select("id, match_number, home_score, away_score"); // 👈 Pedimos match_number

  if (matchError) {
    console.error("🚨 ERROR TRAIENDO PARTIDOS:", matchError);
  }

  // Un partido se considera jugado SI Y SOLO SI ambos marcadores NO son nulos (y tampoco strings vacíos)
  const playedMatches = (allMatches || []).filter(
    (m) =>
      m.home_score !== null &&
      m.home_score !== "" &&
      m.away_score !== null &&
      m.away_score !== "",
  );

  // 📏 C. CONTAMOS BASADOS EN EL MATCH_NUMBER OFICIAL DE LA FIFA (Estático e inmutable)
  const stats = {
    // 72 partidos de grupos (Match Number 1 al 72)
    groups: playedMatches.filter(
      (m) => m.match_number >= 1 && m.match_number <= 72,
    ).length,
    // 16 partidos de 16avos (Match Number 73 al 88)
    r32: playedMatches.filter(
      (m) => m.match_number >= 73 && m.match_number <= 88,
    ).length,
    // 8 partidos de 8vos (Match Number 89 al 96)
    r16: playedMatches.filter(
      (m) => m.match_number >= 89 && m.match_number <= 96,
    ).length,
    // 4 partidos de cuartos (Match Number 97 al 100)
    qf: playedMatches.filter(
      (m) => m.match_number >= 97 && m.match_number <= 100,
    ).length,
    // 2 partidos de semis (Match Number 101 al 102)
    sf: playedMatches.filter(
      (m) => m.match_number >= 101 && m.match_number <= 102,
    ).length,
    // 2 partidos de finales (Match Number 103 al 104)
    f: playedMatches.filter(
      (m) => m.match_number >= 103 && m.match_number <= 104,
    ).length,
  };

  return { config, stats };
}

// 3. Activar/Desactivar Fases + INYECCIÓN MASIVA CREADORA 💥🛡️
export async function togglePhaseAction(
  phaseColumn: string,
  isOpen: boolean,
  shouldClearPredictions: boolean = false,
) {
  const supabase = await createClient();
  try {
    const { error: updateError } = await supabase
      .from("global_config")
      .update({ [phaseColumn]: isOpen })
      .eq("id", 1);

    if (updateError) throw updateError;

    if (shouldClearPredictions) {
      let currentPhaseStart = 0;
      let currentPhaseEnd = 0;
      let futurePhaseStart = 0;
      let dateColumnToReset = "";

      if (phaseColumn === "allow_r32") {
        currentPhaseStart = 73;
        currentPhaseEnd = 88;
        futurePhaseStart = 89;
        dateColumnToReset = "sub_date_r32";
      } else if (phaseColumn === "allow_r16") {
        currentPhaseStart = 89;
        currentPhaseEnd = 96;
        futurePhaseStart = 97;
        dateColumnToReset = "sub_date_r16";
      } else if (phaseColumn === "allow_qf") {
        currentPhaseStart = 97;
        currentPhaseEnd = 100;
        futurePhaseStart = 101;
        dateColumnToReset = "sub_date_qf";
      } else if (phaseColumn === "allow_sf") {
        currentPhaseStart = 101;
        currentPhaseEnd = 102;
        futurePhaseStart = 103;
        dateColumnToReset = "sub_date_sf";
      } else if (phaseColumn === "allow_f") {
        currentPhaseStart = 103;
        currentPhaseEnd = 104;
        futurePhaseStart = 105;
        dateColumnToReset = "sub_date_f";
      }

      if (currentPhaseStart > 0) {
        // --- PASO A: Buscar Partidos y Fans ---
        const { data: officialMatches } = await supabase
          .from("matches")
          .select("id, home_team_id, away_team_id")
          .gte("match_number", currentPhaseStart)
          .lte("match_number", currentPhaseEnd);

        // Traemos a TODOS los perfiles para ir a la fija
        const { data: fans } = await supabase.from("profiles").select("id");

        if (
          officialMatches &&
          officialMatches.length > 0 &&
          fans &&
          fans.length > 0
        ) {
          const currentMatchIds = officialMatches.map((m) => m.id);

          // 1. Borramos basura previa
          await supabase
            .from("predictions")
            .delete()
            .in("match_id", currentMatchIds);

          // 2. Preparamos el batallón con las COLUMNAS CORRECTAS 🎯
          const newPredictions = [];
          for (const match of officialMatches) {
            for (const fan of fans) {
              newPredictions.push({
                user_id: fan.id,
                match_id: match.id,
                predicted_home_team: match.home_team_id, // 👈 CORREGIDO
                predicted_away_team: match.away_team_id, // 👈 CORREGIDO
                pred_home: null,
                pred_away: null,
                predicted_winner: null,
              });
            }
          }

          // 3. Inyectamos a la fuerza
          if (newPredictions.length > 0) {
            const { error: insertError } = await supabase
              .from("predictions")
              .insert(newPredictions);
            if (insertError) {
              console.error("🚨 EXPLOSIÓN EN EL INSERT:", insertError);
            }
          }
        }

        // --- PASO B: DESTRUIR EL FUTURO ---
        if (futurePhaseStart <= 104) {
          const { data: futureMatches } = await supabase
            .from("matches")
            .select("id")
            .gte("match_number", futurePhaseStart);

          if (futureMatches && futureMatches.length > 0) {
            const idsToDelete = futureMatches.map((m) => m.id);
            await supabase
              .from("predictions")
              .delete()
              .in("match_id", idsToDelete);
          }
        }

        // --- PASO C: ABRIR EL CANDADO ---
        if (dateColumnToReset) {
          // Abrimos el candado para todos
          await supabase
            .from("profiles")
            .update({ [dateColumnToReset]: null })
            .neq("id", "00000000-0000-0000-0000-000000000000");
        }
      }
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error actualizando fase:", error);
    return { success: false, error: error.message };
  }
}
