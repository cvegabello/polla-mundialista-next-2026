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

// 3. Activar/Desactivar Fases + DESTRUCTOR DE MUNDOS HIPOTÉTICOS (A prueba de balas) 💥🛡️
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

    // EL DESTRUCTOR PROTEGIDO (Usando match_number estático)
    if (shouldClearPredictions) {
      let startMatchNumber = 0;

      // Definimos desde qué MATCH_NUMBER borrar
      if (phaseColumn === "allow_r32") startMatchNumber = 73;
      else if (phaseColumn === "allow_r16") startMatchNumber = 89;
      else if (phaseColumn === "allow_qf") startMatchNumber = 97;
      else if (phaseColumn === "allow_sf") startMatchNumber = 101;
      else if (phaseColumn === "allow_f") startMatchNumber = 103;

      if (startMatchNumber > 0) {
        // PASO 1: Buscar cuáles son los "IDs" físicos de la base de datos que corresponden a esos Match Numbers
        const { data: matchesToDelete } = await supabase
          .from("matches")
          .select("id")
          .gte("match_number", startMatchNumber);

        if (matchesToDelete && matchesToDelete.length > 0) {
          const idsToDelete = matchesToDelete.map((m) => m.id);

          // PASO 2: Borramos las predicciones de esos IDs específicos
          const { error: deleteError } = await supabase
            .from("predictions")
            .delete()
            .in("match_id", idsToDelete); // 👈 Borrado preciso

          if (deleteError) throw deleteError;
        }

        // PASO 3: Desbloqueamos a los fans para que vuelvan a pronosticar con llaves reales
        await supabase
          .from("profiles")
          .update({ submission_date: null })
          .neq("role", "SUPER-ADMIN");
      }
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error actualizando fase:", error);
    return { success: false, error: error.message };
  }
}
