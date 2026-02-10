// services/pollaService.ts
import { supabase } from "@/lib/supabase";

// Función para obtener todas las pollas activas
export const getActivePollas = async () => {
  try {
    const { data, error } = await supabase
      .from("pollas")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    if (data) {
      // Devolvemos los datos ya formateados para que el componente no tenga que hacer map
      return data.map((polla) => ({
        value: polla.id,
        label: polla.name,
      }));
    }

    return [];
  } catch (error) {
    console.error("Error en getActivePollas:", error);
    throw error; // Lanzamos el error para que el componente decida qué hacer
  }
};
