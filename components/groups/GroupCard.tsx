import React from "react";
// OJO: Si GroupData da error de importación, actualice su archivo @/types
// o use las interfaces que defino aquí abajo temporalmente.
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";

// --- 1. DEFINIMOS LA FORMA DE LOS DATOS REALES (Supabase) ---
// (Lo ideal es llevar esto a su archivo types.ts después)
interface Team {
  name_es: string;
  flag_code: string;
}

interface MatchReal {
  id: number;
  match_date: string;
  stadium: string;
  city: string;
  home_score?: number | null;
  away_score?: number | null;
  home_team: Team; // Relación con la tabla teams
  away_team: Team; // Relación con la tabla teams
}

interface GroupDataReal {
  id: string; // "A"
  name: string; // "Grupo A"
  matches: MatchReal[];
}

interface GroupCardProps {
  group: GroupDataReal;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <div className="relative group w-full max-w-[350px] mx-auto transition-all duration-300">
      {/* --- GLOW (RESPLANDOR) - SU DISEÑO ORIGINAL --- */}
      <div
        className="absolute -inset-1 rounded-2xl blur-md transition duration-500
        bg-gradient-to-r 
        from-cyan-500 to-purple-600 
        dark:from-orange-500 dark:to-white
        opacity-25 group-hover:opacity-100
        dark:opacity-0 dark:group-hover:opacity-100
      "
      ></div>

      {/* TARJETA PRINCIPAL */}
      <div
        className="relative 
        bg-slate-900/90 border-white/10 text-white
        dark:bg-gradient-to-br dark:from-blue-50/95 dark:via-white/90 dark:to-blue-100/90 
        dark:border-white/60 dark:text-slate-800
        backdrop-blur-xl border rounded-xl h-full flex flex-col justify-between overflow-hidden shadow-sm transition-colors duration-300"
      >
        {/* Barra Neón Superior */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00c6ff] to-[#ff4b2b]"></div>

        <div className="p-4 flex flex-col h-full justify-between">
          {/* Cabecera */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 dark:border-slate-200/50">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 dark:from-blue-700 dark:to-purple-600">
              {group.name}
            </h3>
            <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              {group.id === "K" ? "Grupo de Colombia" : "Fase 1"}
            </span>
          </div>

          {/* Partidos */}
          <div className="space-y-1 mb-4">
            {/* AQUÍ OCURRE LA MAGIA: Pasamos el 'match' real al MatchRow */}
            {group.matches.map((match) => (
              <MatchRow key={match.id} match={match} editable={true} />
            ))}
          </div>

          {/* Tabla */}
          <GroupTable />
        </div>
      </div>
    </div>
  );
};
