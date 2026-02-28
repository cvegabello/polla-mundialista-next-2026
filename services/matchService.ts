import { supabase } from "@/lib/supabase";

export const getOfficialMatches = async () => {
  try {
    // 1. SELECT BÁSICO: Solo traemos la tabla, sin meter a los equipos todavía
    const { data, error } = await supabase
      .from("matches")
      .select("*")
      .not("home_score", "is", null);

    if (error) {
      console.error("❌ Error de Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("❌ Error en el servicio:", error);
    return [];
  }
};
