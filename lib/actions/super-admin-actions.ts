"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveOfficialScoreAction(
  matchId: number,
  homeScore: number | null, // 👈 Agréguele el " | null" aquí
  awayScore: number | null,
  winnerId: string | null = null,
) {
  const supabase = await createClient();
  try {
    const { error } = await supabase
      .from("matches")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        winner_id: winnerId,
        status: "FINALIZADO", // Opcional: marcamos el partido como terminado
      })
      .eq("id", matchId);

    if (error) throw error;

    // Magia pura: Al guardar el resultado oficial, le decimos a Next.js
    // que recargue el dashboard del Fan para que todos vean los puntos calculados de inmediato.
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error guardando marcador oficial:", error.message);
    return { success: false, error: error.message };
  }
}

// Función para sincronizar los equipos de las llaves en la base de datos
export const syncBracketTeamsAction = async (
  updates: {
    matchId: number;
    homeTeamId: string | null;
    awayTeamId: string | null;
  }[],
) => {
  try {
    const supabase = await createClient();

    // Actualizamos cada partido que haya tenido un cambio de equipo
    for (const update of updates) {
      const { error } = await supabase
        .from("matches")
        .update({
          home_team_id: update.homeTeamId,
          away_team_id: update.awayTeamId,
        })
        .eq("id", update.matchId);

      if (error) throw error;
    }

    // Limpiamos el caché para que los fans vean los cambios al instante
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error sincronizando los equipos de las llaves:", error);
    throw error;
  }
};
