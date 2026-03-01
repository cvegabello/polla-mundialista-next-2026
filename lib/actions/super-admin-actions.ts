"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveOfficialScoreAction(
  matchId: number,
  homeScore: number,
  awayScore: number,
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
