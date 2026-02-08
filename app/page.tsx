import { createClient } from "@supabase/supabase-js";
import { GroupCard } from "@/components/groups/GroupCard";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";
import { LoginMockup } from "@/components/auth/LoginMockup"; // Importe el nuevo archivo

// Evitamos caché para ver siempre datos frescos
export const dynamic = "force-dynamic";

export default async function Home() {
  // 1. CLIENTE BÁSICO (Directo a la DB, sin Auth)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // 2. CONSULTA DE DATOS (Grupos -> Partidos -> Equipos)
  const { data: groups, error } = await supabase
    .from("groups")
    .select(
      `
      id,
      name,
      matches (
        id,
        match_date,
        stadium,
        city,
        home_score,
        away_score,
        home_team:teams!home_team_id (name_es, flag_code, name_en),
        away_team:teams!away_team_id (name_es, flag_code, name_en)
      )
    `,
    )
    .order("id");

  if (error) {
    return (
      <div className="p-10 text-white text-center">
        Error cargando datos: {error.message}
      </div>
    );
  }

  // 3. ORDENAR PARTIDOS POR FECHA
  const groupsSorted = groups?.map((group) => ({
    ...group,
    matches: group.matches.sort(
      (a: any, b: any) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    ),
  }));

  // return (
  //   <main className="min-h-screen p-4 md:p-8 transition-colors duration-300 bg-transparent dark:bg-transparent relative">
  //     <StarBackground />
  //     <CloudsBackground />

  //     <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 pb-2 relative z-10">
  //       Mi Polla Mundialista 2026
  //     </h1>

  //     <div className="flex justify-center mb-8 relative z-10">
  //       <ThemeToggle />
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center relative z-10">
  //       {groupsSorted?.map((group, index) => (
  //         // @ts-ignore
  //         <GroupCard
  //           key={group.id}
  //           group={group}
  //           lang={index < 2 ? "es" : "en"}
  //           // YA NO PASAMOS TOKENS, NO HACEN FALTA
  //         />
  //       ))}
  //     </div>
  //   </main>
  // );
  return <LoginMockup />;
}
