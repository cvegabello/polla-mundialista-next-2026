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

// 2. Activar/Desactivar Fases + DESTRUCTOR DE MUNDOS HIPOTÉTICOS 💥
export async function togglePhaseAction(
  phaseColumn: string,
  isOpen: boolean,
  shouldClearPredictions: boolean = false, // 👈 Recibimos la instrucción estricta desde el cliente
) {
  const supabase = await createClient();
  try {
    // A. Actualizamos el switch en la base de datos
    const { error: updateError } = await supabase
      .from("global_config")
      .update({ [phaseColumn]: isOpen })
      .eq("id", 1); // Asumiendo que su config es la fila 1

    if (updateError) throw updateError;

    // B. SI ESTAMOS ABRIENDO UNA FASE Y SE PERMITE BORRAR, BORRAMOS EL FUTURO HIPOTÉTICO
    if (shouldClearPredictions) {
      let startMatchId = 0;

      // Identificamos desde qué partido borrar según la fase que se abrió
      if (phaseColumn === "allow_r32")
        startMatchId = 73; // 16avos (73 al 88)
      else if (phaseColumn === "allow_r16")
        startMatchId = 89; // Octavos (89 al 96)
      else if (phaseColumn === "allow_qf")
        startMatchId = 97; // Cuartos (97 al 100)
      else if (phaseColumn === "allow_sf")
        startMatchId = 101; // Semis (101 y 102)
      else if (phaseColumn === "allow_f") startMatchId = 103; // Finales (103 y 104)

      if (startMatchId > 0) {
        // 1. Borramos los pronósticos de ahí en adelante
        await supabase
          .from("predictions")
          .delete()
          .gte("match_id", startMatchId);

        // 2. Le quitamos el "candado" (submission_date) a TODOS los usuarios
        // para que tengan que volver a entrar y enviar su nueva polla.
        await supabase
          .from("profiles")
          .update({ submission_date: null })
          .neq("role", "SUPER-ADMIN"); // No bloquear al admin
      }
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Error actualizando fase:", error);
    return { success: false, error: error.message };
  }
}
