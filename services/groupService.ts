// src/services/groupService.ts
// 👇 1. Cambiamos el import viejo por el Teléfono Rojo
import { createClient } from "@/utils/supabase/server";

export const getFullGroupsData = async () => {
  try {
    // 👇 2. Levantamos la conexión segura al principio de la función
    const supabase = await createClient();

    // 1. CONSULTA CORREGIDA: Agregamos el 'id' en los select de los equipos (INTACTA)
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

    // 2. LÓGICA DE ORDENAMIENTO (INTACTA)
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
