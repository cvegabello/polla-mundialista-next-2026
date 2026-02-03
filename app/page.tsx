import { GroupCard } from "@/components/groups/GroupCard";
import { GroupData } from "@/types";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

// DATOS DUMMY (Solo para ver el diseño hoy)
const dummyGroups: GroupData[] = Array.from({ length: 12 }).map((_, i) => ({
  name: `Grupo ${String.fromCharCode(65 + i)}`, // Genera "Grupo A", "Grupo B"...
  matches: [
    {
      id: 1,
      date: "2026-06-11",
      homeTeam: { id: 1, name: "Nueva Zelanda", flagCode: "de" },
      awayTeam: { id: 2, name: "Costa de Marfil", flagCode: "sco" },
    },
    {
      id: 2,
      date: "2026-06-11",
      homeTeam: { id: 3, name: "Repechaje UEFA B", flagCode: "hun" },
      awayTeam: { id: 4, name: "Uzbekistán", flagCode: "ch" },
    },
    // ... más partidos
  ],
}));

export default function Home() {
  return (
    // Cambié el fondo negro por un gris claro (bg-gray-50)
    <main className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      <h1 className="text-3xl md:text-5xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-red-500">
        Mi Polla Mundialista 2026
      </h1>
      <ThemeToggle />
      {/* PUNTO 2: Aquí controlas el espacio (gap) entre las tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 max-w-[1600px] mx-auto justify-items-center">
        {dummyGroups.map((group) => (
          <GroupCard key={group.name} group={group} />
        ))}
      </div>
    </main>
  );
}
