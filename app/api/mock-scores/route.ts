import { createClient } from "@supabase/supabase-js";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const type = searchParams.get("type"); // "official" o "fan"
  const userId = searchParams.get("userId"); // requerido solo si es "fan"

  // La misma contraseña de su semilla
  const MY_SECRET_KEY = process.env.SEED_SECRET;

  if (!MY_SECRET_KEY || secret !== MY_SECRET_KEY) {
    return NextResponse.json(
      { error: "⛔ Acceso Denegado: Contraseña incorrecta." },
      { status: 401 },
    );
  }

  if (!type || (type !== "official" && type !== "fan")) {
    return NextResponse.json(
      { error: "⛔ Falta el parámetro 'type'. Use ?type=official o ?type=fan" },
      { status: 400 },
    );
  }

  if (type === "fan" && !userId) {
    return NextResponse.json(
      {
        error:
          "⛔ Para llenar pronósticos de un fan, agregue &userId=SU_ID_AQUI",
      },
      { status: 400 },
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  try {
    // 1. Traer solo los 72 partidos de grupos (Ignorar las finales "FI")
    const { data: matches, error: fetchError } = await supabase
      .from("matches")
      .select("*")
      .neq("group_id", "FI");

    if (fetchError || !matches) throw fetchError;

    // Generador de goles random (de 0 a 4 goles)
    const getRandomScore = () => Math.floor(Math.random() * 5);

    // ⚽ ESCENARIO A: Llenar marcadores Oficiales del SuperAdmin
    if (type === "official") {
      const updates = matches.map((m) => {
        const hScore = getRandomScore();
        const aScore = getRandomScore();
        let winnerId = null;
        if (hScore > aScore) winnerId = m.home_team_id;
        else if (aScore > hScore) winnerId = m.away_team_id;

        return {
          ...m,
          home_score: hScore,
          away_score: aScore,
          winner_id: winnerId,
        };
      });

      const { error } = await supabase.from("matches").upsert(updates);
      if (error) throw error;

      return NextResponse.json({
        message:
          "✅ ¡BINGO! 72 Marcadores Oficiales aleatorios generados exitosamente.",
      });
    }

    // 🧑‍💻 ESCENARIO B: Llenar pronósticos para un Fan de prueba
    if (type === "fan") {
      const predictions = matches.map((m) => {
        const hScore = getRandomScore();
        const aScore = getRandomScore();
        let winnerId = null;
        if (hScore > aScore) winnerId = m.home_team_id;
        else if (aScore > hScore) winnerId = m.away_team_id;

        return {
          user_id: userId,
          match_id: m.id,
          pred_home: hScore,
          pred_away: aScore,
          predicted_winner: winnerId,
        };
      });

      const { error } = await supabase
        .from("predictions")
        .upsert(predictions, { onConflict: "user_id, match_id" });
      if (error) throw error;

      return NextResponse.json({
        message: `✅ ¡LISTO! 72 Pronósticos aleatorios cargados para el usuario ${userId}`,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
