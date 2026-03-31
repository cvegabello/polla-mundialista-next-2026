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
  inviteToken?: string,
  language: string = "es", // 👈 NUEVO: Ahora recibe el idioma
): Promise<LoginResult> => {
  try {
    const supabase = await createClient();

    // 🌍 DICCIONARIO DE MENSAJES (VAR Multilingüe)
    const msgs = {
      wrongPin:
        language === "es"
          ? "Contraseña incorrecta o el nombre de usuario ya está en uso."
          : "Incorrect password or username already taken.",
      maintAdmin:
        language === "es"
          ? "Acceso denegado: Área de mantenimiento."
          : "Access denied: Maintenance area.",
      needLink:
        language === "es"
          ? "Usuario no encontrado. Si eres nuevo, necesitas el link de invitación de tu grupo."
          : "User not found. If you are new, you need your group's invitation link.",
      invalidLink:
        language === "es"
          ? "El link de invitación es inválido o ya expiró."
          : "The invitation link is invalid or expired.",
      maintCreate:
        language === "es"
          ? "No se pueden crear usuarios en mantenimiento."
          : "Cannot create users during maintenance.",
      successCreated:
        language === "es"
          ? "¡Cuenta creada exitosamente!"
          : "Account successfully created!",
      dbError:
        language === "es"
          ? "Error de conexión con la base de datos."
          : "Database connection error.",
    };

    const { data: existingUser, error: searchError } = await supabase
      .from("profiles")
      .select(
        `
        id, username, pin, role, polla_id, status,
        sub_date_groups, sub_date_r32, sub_date_r16, sub_date_qf, sub_date_sf, sub_date_f
      `,
      )
      .ilike("username", username.trim())
      .maybeSingle();

    if (searchError) throw searchError;

    // --- ESCENARIO A: VETERANO ---
    if (existingUser) {
      if (existingUser.pin !== pin)
        return { success: false, message: msgs.wrongPin };

      let pollaName = "";
      if (existingUser.polla_id) {
        const { data: pData } = await supabase
          .from("pollas")
          .select("name")
          .eq("id", existingUser.polla_id)
          .maybeSingle();
        if (pData) pollaName = pData.name;
      }

      if (
        pollaName === "Mantenimiento" &&
        existingUser.role !== "SUPER-ADMIN"
      ) {
        return { success: false, message: msgs.maintAdmin };
      }

      const userToReturn = { ...existingUser, polla_name: pollaName };
      return { success: true, user: userToReturn, isNewUser: false };
    }

    // --- ESCENARIO B: NOVATO ---
    else {
      if (!inviteToken) return { success: false, message: msgs.needLink };

      const { data: pollaData, error: pollaError } = await supabase
        .from("pollas")
        .select("id, name")
        .eq("invite_code", inviteToken)
        .maybeSingle();

      if (pollaError || !pollaData)
        return { success: false, message: msgs.invalidLink };
      if (pollaData.name === "Mantenimiento")
        return { success: false, message: msgs.maintCreate };

      const { data: newUser, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            username: username.trim(),
            pin: pin,
            polla_id: pollaData.id,
            role: "FAN",
            status: "BORRADOR",
            total_points: 0,
            is_paid: false,
          },
        ])
        .select(
          `
          id, username, pin, role, polla_id, status,
          sub_date_groups, sub_date_r32, sub_date_r16, sub_date_qf, sub_date_sf, sub_date_f
        `,
        )
        .single();

      if (createError) throw createError;

      const userToReturn = { ...newUser, polla_name: pollaData.name };

      return {
        success: true,
        user: userToReturn,
        isNewUser: true,
        message: msgs.successCreated,
      };
    }
  } catch (error) {
    console.error("Error en authService:", error);
    return {
      success: false,
      message: "Error de conexión con la base de datos.",
    }; // Fallback final
  }
};
