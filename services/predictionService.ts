// src/services/predictionService.ts

// 👇 1. Importamos el Teléfono Rojo para el Servidor
import { createClient as createServerClient } from "@/utils/supabase/server";
// 👇 2. Importamos el Teléfono Celular para el Navegador (Tiempo Real)
import { createBrowserClient } from "@supabase/ssr";

// 1. LEER TODAS (Se ejecuta en el Servidor ⚡)
export const getUserPredictions = async (userId: string) => {
  try {
    const supabase = await createServerClient(); // 🔴 Teléfono Rojo

    const { data, error } = await supabase
      .from("predictions")
      // 👇 MAGIA FINAL: ¡Agregamos predicted_home_team y predicted_away_team a la consulta!
      .select(
        "match_id, pred_home, pred_away, predicted_winner, points_won, predicted_home_team, predicted_away_team",
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error trayendo predicciones:", error);
    return [];
  }
};

// 2. GUARDAR (UPSERT) (Se ejecuta en el Servidor ⚡)
export const savePrediction = async (
  userId: string,
  matchId: number,
  homeScore: number | null,
  awayScore: number | null,
  predictedWinner: string | null = null,
) => {
  const supabase = await createServerClient(); // 🔴 Teléfono Rojo

  const payload = {
    user_id: userId,
    match_id: matchId,
    pred_home: homeScore,
    pred_away: awayScore,
    predicted_winner: predictedWinner,
  };

  const { error } = await supabase
    .from("predictions")
    .upsert(payload, { onConflict: "user_id, match_id" });

  if (error) throw error;
  return true;
};

// 3. SUSCRIBIRSE A CAMBIOS (REALTIME) 📡 (Se ejecuta en el Celular del Fan 📱)
export const subscribeToGroupPredictions = (
  groupId: string,
  userId: string,
  onUpdate: (newPred: any) => void,
) => {
  // 🟢 Creamos un Teléfono Celular exclusivo para el navegador
  const supabaseBrowser = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const channelName = `realtime-predictions-${groupId}`;

  const channel = supabaseBrowser
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
    supabaseBrowser.removeChannel(channel);
  };
};
