import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FanDashboard } from "@/components/dashboards/FanDashboard";
import { getFullGroupsData } from "@/services/groupService";
import { getUserPredictions } from "@/services/predictionService";
// 👇 Nuestro servicio de partidos oficiales
import { getOfficialMatches } from "@/services/matchService";

// 👇 Optimizaciones de caché de Next.js
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("polla_session");

  // Si no hay galleta, el middleware ya debió sacarlo, pero nos curamos en salud
  if (!sessionCookie) {
    redirect("/login");
  }

  // Leemos la galleta que horneó el LoginMockup
  const userSession = JSON.parse(decodeURIComponent(sessionCookie.value));

  // ⚡ LA MAGIA DE SERVER COMPONENTS: Carga todo en paralelo en milisegundos
  const [groupsData, userPredictions, officialMatchesRaw] = await Promise.all([
    getFullGroupsData(),
    getUserPredictions(userSession.id),
    getOfficialMatches(), // La verdad absoluta de la BD
  ]);

  // 🧠 MASTICAMOS LA DATA OFICIAL EN EL SERVIDOR (Cero carga para el celular)
  const officialScores: any[] = [];
  const officialWinners: Record<string, any> = {};

  if (officialMatchesRaw) {
    officialMatchesRaw.forEach((m: any) => {
      officialScores.push({
        match_id: m.id,
        home_score: m.home_score,
        away_score: m.away_score,
        winner_id: m.winner_id,
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

  // Opcional: leer el idioma de otra cookie si la tiene, o por defecto 'es'
  const langCookie = cookieStore.get("polla_lang")?.value || "es";

  return (
    <FanDashboard
      userSession={userSession}
      groupsData={groupsData}
      userPredictions={userPredictions}
      officialScores={officialScores}
      officialWinners={officialWinners}
      loadingData={false} // 👈 Ya nunca habrá spinner, la data llega instantánea
      lang={langCookie as "es" | "en"}
    />
  );
}
