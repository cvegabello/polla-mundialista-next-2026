"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();
  // Borramos la galleta del servidor
  cookieStore.delete("polla_session");
  // Y lo mandamos pal login de una vez
  redirect("/login");
}
