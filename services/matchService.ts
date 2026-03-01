import { createClient } from "@/utils/supabase/server";

export const getOfficialMatches = async () => {
  try {
    // 1. Levantamos el teléfono rojo
    const supabase = await createClient();

    // 2. Hacemos la consulta normal (PERO SIN FILTRAR LOS NULOS)
    const { data, error } = await supabase.from("matches").select(
      `
        id,
        home_score,
        away_score,
        winner_id,
        home_team_id,
        away_team_id,
        home_team:teams!home_team_id(id, name_es, flag_code, name_en),
        away_team:teams!away_team_id(id, name_es, flag_code, name_en)
      `,
    ); // 👈 ¡Bórrele el .not() de aquí!

    if (error) {
      console.error("Error trayendo resultados oficiales:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error en matchService:", error);
    return [];
  }
};
