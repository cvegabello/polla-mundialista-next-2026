// src/services/groupService.ts
import { supabase } from "@/lib/supabase";

export const getFullGroupsData = async () => {
  try {
    // 1. CONSULTA CORREGIDA: Agregamos el 'id' en los select de los equipos
    const { data: groups, error } = await supabase
      .from("groups")
      .select(
        `
        id,
        name,
        matches (
          id,
          match_date,
          stadium,
          city,
          home_score,
          away_score,
          home_team_id,
          away_team_id,
          home_team:teams!home_team_id (id, name_es, flag_code, name_en),
          away_team:teams!away_team_id (id, name_es, flag_code, name_en)
        )
      `,
      )
      .order("id");

    if (error) {
      console.error("Error cargando grupos:", error);
      return [];
    }

    // 2. LÓGICA DE ORDENAMIENTO
    const groupsSorted = groups?.map((group) => ({
      ...group,
      matches: group.matches.sort(
        (a: any, b: any) =>
          new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
      ),
    }));

    return groupsSorted || [];
  } catch (err) {
    console.error("Error en servicio de grupos:", err);
    return [];
  }
};
