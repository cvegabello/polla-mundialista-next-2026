import { supabase } from "@/lib/supabase";

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
    // 1. BUSCAR SI EL USUARIO YA EXISTE
    const { data: existingUser, error: searchError } = await supabase
      .from("profiles")
      .select("*")
      // 👇 AQUÍ ESTÁ EL CAMBIO CLAVE:
      // Usamos .ilike() en vez de .eq() para ignorar mayúsculas/minúsculas
      .ilike("username", username.trim())
      .eq("polla_id", pollaId)
      .maybeSingle();

    if (searchError) throw searchError;

    // --- ESCENARIO A: USUARIO YA EXISTE ---
    if (existingUser) {
      if (existingUser.pin === pin) {
        // ÉXITO: Devolvemos el usuario TAL CUAL está en la base de datos
        // (Así, si se registró como "Carlos", aunque entre como "cARLOS", verá "Carlos")
        return { success: true, user: existingUser, isNewUser: false };
      } else {
        // PIN INCORRECTO
        // Usamos existingUser.username para mostrar el nombre real en el mensaje
        return {
          success: false,
          message: `El usuario '${existingUser.username}' ya existe. Si eres tú, corrige el PIN.`,
        };
      }
    }

    // --- ESCENARIO B: USUARIO NUEVO (REGISTRO) ---
    else {
      // Opcional: ¿Quiere guardar siempre en minúsculas o respetar como lo escribió la primera vez?
      // Por ahora respetamos como lo escribió (username.trim()), pero la búsqueda futura usará ilike.
      const { data: newUser, error: createError } = await supabase
        .from("profiles")
        .insert([
          {
            username: username.trim(), // Se guarda como lo escribió la primera vez (Ej: "Carlos")
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
