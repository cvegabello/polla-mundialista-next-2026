import { createClient } from "@supabase/supabase-js";
import { GroupCard } from "@/components/groups/GroupCard";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { StarBackground } from "@/components/shared/StarBackground";
import { CloudsBackground } from "@/components/shared/CloudsBackground";

// 1. INICIALIZAMOS SUPABASE (Lado del Servidor)
// Usamos las mismas variables que ya configuramos en .env.local
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

// Hacemos el componente ASYNC para poder esperar los datos
export default async function Home() {
  // 2. LA CONSULTA MAESTRA A LA BASE DE DATOS
  // Le decimos: "Traigame los Grupos, y por dentro sus Partidos, y por dentro los Equipos"
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
        home_team:teams!home_team_id (name_es, flag_code),
        away_team:teams!away_team_id (name_es, flag_code)
      )
    `,
    )
    .order("id"); // Ordenar Grupos A, B, C...

  if (error) {
    console.error("Error cargando el mundial:", error);
    return <div>Error cargando datos: {error.message}</div>;
  }

  // 3. ORDENAR PARTIDOS POR FECHA (Pequeño ajuste manual)
  // A veces la DB los devuelve en desorden, así aseguramos que el partido 1 salga primero
  const groupsSorted = groups?.map((group) => ({
    ...group,
    matches: group.matches.sort(
      (a: any, b: any) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
    ),
  }));

  return (
    // RECORDATORIO: Mantener 'bg-transparent' y 'dark:bg-transparent'
    // para que se vean los fondos que están detrás.
    <main className="min-h-screen p-4 md:p-8 transition-colors duration-300 bg-transparent dark:bg-transparent relative">
      {/* --- FONDOS ANIMADOS --- */}
      {/* Estrellas (Solo noche) */}
      <StarBackground />
      {/* 2. AGREGAR NUBES (Solo día) AQUÍ */}
      <CloudsBackground />
      {/* ----------------------- */}

      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-500 pb-2 relative z-10">
        Mi Polla Mundialista 2026
      </h1>

      <div className="flex justify-center mb-8 relative z-10">
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center relative z-10">
        {groupsSorted?.map((group) => (
          // @ts-ignore
          <GroupCard key={group.id} group={group} />
        ))}
      </div>
    </main>
  );
}
