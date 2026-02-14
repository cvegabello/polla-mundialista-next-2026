import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FanDashboard } from "@/components/dashboards/FanDashboard";
import { getFullGroupsData } from "@/services/groupService";
import { getUserPredictions } from "@/services/predictionService";

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("polla_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  // Sacamos los datos de la "servilleta"
  const userSession = JSON.parse(decodeURIComponent(sessionCookie.value));

  // Traemos la data de la polla usando el ID de la cookie
  const [groupsData, userPredictions] = await Promise.all([
    getFullGroupsData(),
    getUserPredictions(userSession.id),
  ]);

  return (
    <FanDashboard
      userSession={userSession}
      groupsData={groupsData}
      userPredictions={userPredictions}
      loadingData={false}
      lang="es" // O el que prefiera por defecto
    />
  );
}
