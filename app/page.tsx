import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FanDashboard } from "@/components/dashboards/FanDashboard";
import { getFullGroupsData } from "@/services/groupService";
import { getUserPredictions } from "@/services/predictionService";
import { Language } from "@/components/constants/dictionary";
import { getOfficialMatches } from "@/services/matchService";
// 👇 1. Importamos el cliente de Supabase para poder consultar la tabla nueva
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("polla_session");

  if (!sessionCookie) {
    redirect("/login");
  }

  const userSession = JSON.parse(decodeURIComponent(sessionCookie.value));
  const lang = (userSession.lang as Language) || "es";

  // 👇 2. Inicializamos el teléfono rojo con Supabase
  const supabase = await createClient();

  // ⚡ LA MAGIA: Agregamos la consulta de bonos a la carga en paralelo
  const [
    groupsData,
    userPredictions,
    officialMatchesRaw,
    bonusesResponse, // 👈 Aquí llega la respuesta de la nueva tabla
  ] = await Promise.all([
    getFullGroupsData(),
    getUserPredictions(userSession.id),
    getOfficialMatches(),
    supabase.from("bonus_points").select("*").eq("user_id", userSession.id), // 👈 Consultamos los bonos del usuario
  ]);

  // Sacamos los datos limpios de la respuesta
  const userBonuses = bonusesResponse.data || [];

  const officialScores: any[] = [];
  const officialWinners: Record<string, any> = {};

  if (officialMatchesRaw) {
    officialMatchesRaw.forEach((m: any) => {
      officialScores.push({
        ...m,
        match_id: m.id,
      });

      if (m.winner_id) {
        const winnerTeam =
          m.winner_id === m.home_team_id ? m.home_team : m.away_team;
        if (winnerTeam) {
          officialWinners[m.id.toString()] = winnerTeam;
        }
      }
    });
  }

  const langCookie = cookieStore.get("polla_lang")?.value || "es";

  return (
    <FanDashboard
      userSession={userSession}
      groupsData={groupsData}
      userPredictions={userPredictions}
      officialScores={officialScores}
      officialWinners={officialWinners}
      loadingData={false}
      lang={lang}
      userBonuses={userBonuses} // 👈 3. ¡EL PASE GOL! Le mandamos los bonos a la vista
    />
  );
}
