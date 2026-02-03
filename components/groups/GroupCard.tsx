import React from "react";
import { GroupData } from "@/types";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";

interface GroupCardProps {
  group: GroupData;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <div className="relative group w-full max-w-[350px] mx-auto transition-all duration-300">
      {/* --- GLOW (RESPLANDOR) REFORZADO --- */}
      <div
        className="absolute -inset-1 rounded-2xl blur-md transition duration-500
        /* Definimos el degradado base */
        bg-gradient-to-r 
        
        /* COLORES DÍA: Cyan a Morado */
        from-cyan-500 to-purple-600 
        
        /* COLORES NOCHE: Naranja fuerte a Blanco (Sobrescribe al día) */
        dark:from-orange-500 dark:to-white
        
        /* OPACIDAD: */
        /* Día: Tenue (25%) -> Brilla al Hover (100%) */
        opacity-25 group-hover:opacity-100
        
        /* Noche: Invisible (0%) -> Brilla fuerte al Hover (80-100%) */
        dark:opacity-0 dark:group-hover:opacity-100
      "
      ></div>

      {/* TARJETA PRINCIPAL (Contenido) */}
      <div
        className="relative 
        /* Modo Día: Oscuro */
        bg-slate-900/90 border-white/10 text-white
        
        /* Modo Noche: Claro */
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
              Fase 1
            </span>
          </div>

          {/* Partidos */}
          <div className="space-y-1 mb-4">
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
