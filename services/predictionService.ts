// src/services/predictionService.ts
import { supabase } from "@/lib/supabase";

// 1. LEER TODAS (Ya la teníamos)
export const getUserPredictions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("predictions")
      .select("match_id, pred_home, pred_away, predicted_winner")
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error trayendo predicciones:", error);
    return [];
  }
};

// 2. GUARDAR (UPSERT) - NUEVA 💾
export const savePrediction = async (
  userId: string,
  matchId: number,
  homeScore: number | null,
  awayScore: number | null,
  predictedWinner: string | null = null, // 👈 Lo dejamos como string y opcional por defecto
) => {
  const payload = {
    user_id: userId,
    match_id: matchId,
    pred_home: homeScore,
    pred_away: awayScore,
    predicted_winner: predictedWinner, // 👈 Excelente deducción
  };

  const { error } = await supabase
    .from("predictions")
    .upsert(payload, { onConflict: "user_id, match_id" });

  if (error) throw error;
  return true;
};

// 3. SUSCRIBIRSE A CAMBIOS (REALTIME) - NUEVA 📡
// Esta función recibe un "callback" (una función) que se ejecutará cuando llegue un dato nuevo.
export const subscribeToGroupPredictions = (
  groupId: string,
  userId: string,
  onUpdate: (newPred: any) => void,
) => {
  const channelName = `realtime-predictions-${groupId}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "*", // Escuchar INSERT y UPDATE
        schema: "public",
        table: "predictions",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        // Cuando llegue un dato, ejecutamos la función que nos pasó el componente
        if (payload.new) {
          onUpdate(payload.new);
        }
      },
    )
    .subscribe();

  // Devolvemos una función de limpieza para que el componente pueda desuscribirse
  return () => {
    supabase.removeChannel(channel);
  };
};
