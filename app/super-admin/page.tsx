import { getFullGroupsData } from "@/services/groupService";
import { SuperAdminDashboard } from "@/components/dashboards/SuperAdminDashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Language } from "@/components/constants/dictionary";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("polla_session");

  if (!sessionCookie) redirect("/login");

  const userSession = JSON.parse(decodeURIComponent(sessionCookie.value));

  // 🛡️ CANDADO DE SEGURIDAD: Solo el SUPER-ADMIN puede ver esto
  if (userSession.role !== "SUPER-ADMIN") {
    redirect("/"); // Si es un Fan o infiltrado, lo mandamos al inicio
  }

  const lang = (userSession.lang as Language) || "es";
  const groupsData = await getFullGroupsData();

  return <SuperAdminDashboard groupsData={groupsData} lang={lang} />;
}
