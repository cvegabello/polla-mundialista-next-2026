"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitPredictionsAction(userId: string) {
  const supabase = await createClient(); // Ojo: en versiones nuevas de Next/Supabase esto puede requerir await

  try {
    const submissionDate = new Date().toISOString();

    // 👇 AQUÍ USAMOS TU TABLA REAL: 'profiles'
    const { error } = await supabase
      .from("profiles")
      .update({
        submission_date: submissionDate,
        // Opcional: Si quieres cambiar el estado también
        // status: 'submitted'
      })
      .eq("id", userId);

    if (error) {
      console.error("Error Supabase:", error);
      throw new Error("No se pudo actualizar la fecha de envío.");
    }

    // 👇 IMPORTANTE: Esto le dice a Next.js que refresque la caché
    // Asegúrate de que la ruta sea la correcta (ej: '/dashboard' o '/fan')
    revalidatePath("/dashboard");

    return { success: true, date: submissionDate };
  } catch (error) {
    console.error("Error en submitPredictionsAction:", error);
    return { success: false, error: "Error interno del servidor." };
  }
}
