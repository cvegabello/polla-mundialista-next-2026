import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FanDashboard } from "@/components/dashboards/FanDashboard";
import { getFullGroupsData } from "@/services/groupService";
import { getUserPredictions } from "@/services/predictionService";
import { Language } from "@/components/constants/dictionary";
import { getOfficialMatches } from "@/services/matchService";
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
  const supabase = await createClient();

  // ⚡ LA MAGIA: Las 5 consultas en paralelo, perfectas y sin errores
  const [
    groupsData,
    userPredictions,
    officialMatchesRaw,
    bonusesResponse,
    configResponse,
  ] = await Promise.all([
    getFullGroupsData(),
    getUserPredictions(userSession.id),
    getOfficialMatches(),
    supabase.from("bonus_points").select("*").eq("user_id", userSession.id),
    supabase.from("global_config").select("*").single(),
  ]);

  const userBonuses = bonusesResponse.data || [];
  const globalConfig = configResponse.data || {};

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

  return (
    <FanDashboard
      userSession={userSession}
      groupsData={groupsData}
      userPredictions={userPredictions}
      officialScores={officialScores}
      officialWinners={officialWinners}
      loadingData={false}
      lang={lang}
      userBonuses={userBonuses}
      globalConfig={globalConfig}
    />
  );
}
