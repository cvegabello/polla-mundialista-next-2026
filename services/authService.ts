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
    const { data: pollaData } = await supabase
      .from("pollas")
      .select("name")
      .eq("id", pollaId)
      .single();

    const isMantenimiento = pollaData?.name === "Mantenimiento";

    // --- 2. BUSCAR AL USUARIO (CON LAS 6 FECHAS NUEVAS) ---
    const { data: existingUser, error: searchError } = await supabase
      .from("profiles")
      .select(
        `
        id, 
        username, 
        pin, 
        role, 
        polla_id, 
        status,
        sub_date_groups,
        sub_date_r32,
        sub_date_r16,
        sub_date_qf,
        sub_date_sf,
        sub_date_f
      `,
      ) // 👈 Traemos la artillería completa
      .ilike("username", username.trim())
      .eq("polla_id", pollaId)
      .maybeSingle();

    if (searchError) throw searchError;

    // --- ESCENARIO A: EL USUARIO YA EXISTE ---
    if (existingUser) {
      if (existingUser.pin !== pin) {
        return { success: false, message: "Password inválido" };
      }

      if (isMantenimiento && existingUser.role !== "SUPER-ADMIN") {
        return { success: false, message: "Usted no es un super admin" };
      }

      return { success: true, user: existingUser, isNewUser: false };
    }

    // --- ESCENARIO B: EL USUARIO NO EXISTE ---
    else {
      if (isMantenimiento) {
        return { success: false, message: "Usted no es un super admin" };
      }

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
        .select(
          `
          id, username, pin, role, polla_id, status,
          sub_date_groups, sub_date_r32, sub_date_r16, sub_date_qf, sub_date_sf, sub_date_f
        `,
        ) // 👈 También para el usuario nuevo
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
