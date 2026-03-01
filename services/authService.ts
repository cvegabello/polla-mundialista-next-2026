"use server";

import { createClient } from "@/utils/supabase/server";

interface LoginResult {
  success: boolean;
  user?: any;
  message?: string;
  isNewUser?: boolean;
}

export const loginOrRegister = async (
  username: string,
  pin: string,
  pollaId: string,
): Promise<LoginResult> => {
  try {
    const supabase = await createClient();

    // --- 1. IDENTIFICAR LA POLLA ---
    // Traemos el nombre para saber si es la de Mantenimiento
    const { data: pollaData } = await supabase
      .from("pollas")
      .select("name")
      .eq("id", pollaId)
      .single();

    const isMantenimiento = pollaData?.name === "Mantenimiento";

    // --- 2. EL SELECT QUE PEDISTE (BUSCAR AL USUARIO) ---
    const { data: existingUser, error: searchError } = await supabase
      .from("profiles")
      .select("*")
      .ilike("username", username.trim())
      .eq("polla_id", pollaId)
      .maybeSingle();

    if (searchError) throw searchError;

    // --- ESCENARIO A: EL USUARIO YA EXISTE ---
    if (existingUser) {
      // A.1 VALIDAR EL PIN (PASSWORD)
      if (existingUser.pin !== pin) {
        return {
          success: false,
          message: "Password inválido", // 👈 Mensaje directo como pediste
        };
      }

      // A.2 SI EL PIN ES CORRECTO, VALIDAR ROL SI ES MANTENIMIENTO
      if (isMantenimiento && existingUser.role !== "SUPER-ADMIN") {
        return {
          success: false,
          message: "Usted no es un super admin", // 👈 Si el rol no cuadra en Mantenimiento
        };
      }

      // ÉXITO: Pasa el PIN y el Rol (si aplica)
      return { success: true, user: existingUser, isNewUser: false };
    }

    // --- ESCENARIO B: EL USUARIO NO EXISTE ---
    else {
      // 🛑 BLOQUEO PARA MANTENIMIENTO
      if (isMantenimiento) {
        return {
          success: false,
          message: "Usted no es un super admin", // 👈 No existe en la DB = No entra y NO se crea
        };
      }

      // ✅ REGISTRO NORMAL PARA FANS (Si no es mantenimiento)
      const { data: newUser, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            username: username.trim(),
            pin: pin,
            polla_id: pollaId,
            role: "fan",
            status: "active",
            total_points: 0,
            is_paid: false,
          },
        ])
        .select()
        .single();

      if (createError) throw createError;

      return {
        success: true,
        user: newUser,
        isNewUser: true,
        message: "¡Cuenta creada exitosamente!",
      };
    }
  } catch (error) {
    console.error("Error en authService:", error);
    return {
      success: false,
      message: "Error de conexión con la base de datos.",
    };
  }
};
