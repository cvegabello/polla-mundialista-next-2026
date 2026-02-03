// components/groups/MatchRow.tsx
import React from "react";
import { Match } from "@/types";

interface MatchRowProps {
  match: Match;
  editable?: boolean;
}

export const MatchRow = ({ match, editable = false }: MatchRowProps) => {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10 dark:border-slate-200/50 last:border-0">
      {/* --- EQUIPO LOCAL (Izquierda) --- */}
      {/* Cambiamos gap-2 a gap-1 para ganar espacio */}
      <div className="flex items-center gap-1 flex-1 justify-end overflow-hidden">
        {/* Nombre: Bajamos a text-xs y 'uppercase' para que se vea pro y quepa mejor */}
        <span className="text-sm font-semibold text-gray-200 dark:text-slate-700 hidden sm:block text-right leading-tight">
          {match.homeTeam.name}
        </span>

        {/* Código (COL): Se muestra solo en móviles */}
        <span className="font-bold sm:hidden text-gray-200 dark:text-slate-700 shrink-0 text-xs">
          {match.homeTeam.flagCode.toUpperCase()}
        </span>

        {/* BANDERA (El cuadradito) */}
        <div className="w-5 h-3.5 bg-gray-600 dark:bg-gray-300 rounded-[2px] overflow-hidden relative shadow-sm shrink-0">
          {/* Aquí irá la imagen <img src="..." /> */}
        </div>
      </div>

      {/* --- INPUTS CENTRALES (Talla M) --- */}
      <div className="flex items-center gap-1 px-1">
        {" "}
        {/* Gap reducido en el centro también */}
        {editable ? (
          <>
            <input
              type="number"
              className="
              w-10 h-8 md:w-12 md:h-8 text-base shrink-0
              text-center 
              bg-slate-50 text-slate-900 
              border border-cyan-500/50 hover:border-cyan-300
              focus:ring-2 focus:ring-cyan-400
              dark:bg-white/80 dark:border-blue-200 dark:text-blue-800
              rounded-md font-bold focus:outline-none transition-all placeholder-gray-400 shadow-sm"
              placeholder="-"
            />

            <span className="text-gray-500 font-bold shrink-0 text-xs">-</span>

            <input
              type="number"
              className="
              w-10 h-8 md:w-12 md:h-8 text-base shrink-0
              text-center 
              bg-slate-50 text-slate-900 
              border border-cyan-500/50 hover:border-cyan-300
              focus:ring-2 focus:ring-cyan-400
              dark:bg-white/80 dark:border-blue-200 dark:text-blue-800
              rounded-md font-bold focus:outline-none transition-all placeholder-gray-400 shadow-sm"
              placeholder="-"
            />
          </>
        ) : (
          <div className="px-2 py-1 bg-black/30 dark:bg-slate-100 rounded-md border border-white/10 dark:border-slate-200 font-mono font-bold text-white dark:text-slate-700 shrink-0 text-sm">
            {match.homeScore ?? "-"} : {match.awayScore ?? "-"}
          </div>
        )}
      </div>

      {/* --- EQUIPO VISITANTE (Derecha) --- */}
      <div className="flex items-center gap-1 flex-1 justify-start overflow-hidden">
        {/* BANDERA */}
        <div className="w-5 h-3.5 bg-gray-600 dark:bg-gray-300 rounded-[2px] overflow-hidden relative shadow-sm shrink-0"></div>

        {/* Nombre */}
        <span className="text-sm font-semibold text-gray-200 dark:text-slate-700 hidden sm:block text-left leading-tight">
          {match.awayTeam.name}
        </span>

        {/* Código móvil */}
        <span className="font-bold sm:hidden text-gray-200 dark:text-slate-700 shrink-0 text-xs">
          {match.awayTeam.flagCode.toUpperCase()}
        </span>
      </div>
    </div>
  );
};
