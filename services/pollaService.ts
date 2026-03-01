"use server";

import { createClient } from "@/utils/supabase/server";

export const getActivePollas = async (showAll = false) => {
  // 👈 Agregamos este parámetro
  try {
    const supabase = await createClient();
    let query = supabase
      .from("pollas")
      .select("id, name")
      .order("name", { ascending: true });

    // 👇 Si NO pedimos mostrar todo, escondemos Mantenimiento
    if (!showAll) {
      query = query.neq("name", "MANTENIMIENTO");
    }

    const { data, error } = await query;
    if (error) throw error;

    return data ? data.map((p) => ({ value: p.id, label: p.name })) : [];
  } catch (error) {
    console.error("Error en getActivePollas:", error);
    throw error;
  }
};
