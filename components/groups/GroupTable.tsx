"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { TableStats } from "@/types"; // Importamos el tipo global para evitar conflictos

interface GroupTableProps {
  tableData: TableStats[];
  lang?: Language;
  onTableChange?: (data: TableStats[]) => void; // 👈 El "peaje" que faltaba
}

export const GroupTable = ({
  tableData,
  lang = "es",
  onTableChange,
}: GroupTableProps) => {
  const t = DICTIONARY[lang];
  const [displayTeams, setDisplayTeams] = useState<TableStats[]>([]);

  // Sincronizamos la tabla visual cuando cambian los goles
  useEffect(() => {
    setDisplayTeams(tableData);
  }, [tableData]);

  // 🚀 Lógica de intercambio de posición (Combobox de Desempate)
  const handlePositionChange = (currentTeamName: string, newPosStr: string) => {
    const newPos = parseInt(newPosStr);
    if (isNaN(newPos)) return;

    const updatedTeams = [...displayTeams];
    const currentTeamIndex = updatedTeams.findIndex(
      (t) => t.team === currentTeamName,
    );
    const targetTeamIndex = updatedTeams.findIndex((t) => t.pos === newPos);

    if (currentTeamIndex !== -1 && targetTeamIndex !== -1) {
      // Intercambiamos posiciones manuales
      const tempPos = updatedTeams[currentTeamIndex].pos;
      updatedTeams[currentTeamIndex].pos = updatedTeams[targetTeamIndex].pos;
      updatedTeams[targetTeamIndex].pos = tempPos;

      // Ordenamos para que la UI se refresque correctamente
      const finalSorted = [...updatedTeams].sort((a, b) => a.pos - b.pos);

      setDisplayTeams(finalSorted);

      // 🔥 ¡BINGO! Le avisamos al hook para que guarde el cambio en Supabase
      if (onTableChange) {
        onTableChange(finalSorted);
      }
    }
  };

  return (
    <div className="mt-2 bg-slate-200/90 border-slate-300 dark:bg-slate-50/80 dark:border-slate-200/60 rounded-lg p-3 text-xs border shadow-sm overflow-hidden transition-all">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="text-cyan-600 dark:text-cyan-500 font-bold border-b border-slate-300/50 dark:border-slate-300/50 text-[10px] uppercase tracking-tighter">
            <th className="py-2 w-8">#</th>
            <th className="text-left pl-2">{t.team}</th>
            <th className="w-8 text-yellow-600 dark:text-yellow-500 font-extrabold">
              {t.pts}
            </th>
            {/* 📊 NUEVAS COLUMNAS DE RENDIMIENTO */}
            <th className="w-6 text-slate-500">J</th>
            <th className="w-6 text-slate-500">G</th>
            <th className="w-6 text-slate-500">E</th>
            <th className="w-6 text-slate-500">P</th>
            <th className="w-7 text-cyan-600/70 dark:text-cyan-500/70">
              {t.gf}
            </th>
            <th className="w-7 text-cyan-600/70 dark:text-cyan-500/70">
              {t.gc}
            </th>
            <th className="w-7 text-cyan-600/70 dark:text-cyan-500/70">
              {t.dg}
            </th>
          </tr>
        </thead>
        <tbody className="relative">
          {displayTeams.map((row) => {
            const isTop2 = row.pos <= 2;
            return (
              <tr
                key={row.teamId} // Usamos teamId para mayor seguridad
                className={`border-b border-slate-300/50 dark:border-slate-300/50 last:border-0 transition-all duration-500 ease-in-out ${
                  isTop2
                    ? "bg-emerald-100/60 dark:bg-emerald-500/10"
                    : "hover:bg-white/40 dark:hover:bg-white/20"
                }`}
              >
                <td className="py-1.5 px-0.5 relative">
                  {row.isTied ? (
                    <div className="relative w-9 h-6 bg-slate-900 border border-slate-600 rounded flex items-center justify-center mx-auto overflow-hidden shadow-sm animate-pulse">
                      <select
                        className="appearance-none cursor-pointer w-full h-full bg-transparent text-center font-bold text-xs text-amber-400 focus:outline-none z-10 relative pl-0.5"
                        value={row.pos}
                        onChange={(e) =>
                          handlePositionChange(row.team, e.target.value)
                        }
                      >
                        {[1, 2, 3, 4].map((num) => (
                          <option
                            key={num}
                            className="bg-slate-900 text-amber-400"
                            value={num}
                          >
                            {num}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-0.5 w-3 h-3 text-amber-400 pointer-events-none z-0" />
                    </div>
                  ) : (
                    <span
                      className={`font-bold text-sm ${isTop2 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}
                    >
                      {row.pos}
                    </span>
                  )}
                </td>
                <td
                  className={`text-left pl-2 font-bold truncate max-w-[85px] text-[11px] ${isTop2 ? "text-emerald-800 dark:text-emerald-400" : "text-slate-700 dark:text-slate-800"}`}
                >
                  {row.team}
                </td>
                <td className="font-extrabold text-yellow-600 dark:text-yellow-500 text-sm">
                  {row.pts}
                </td>
                {/* 🔢 VALORES DE LAS NUEVAS COLUMNAS */}
                <td className="text-slate-500 font-medium">{row.played}</td>
                <td className="text-slate-500 font-medium">{row.won}</td>
                <td className="text-slate-500 font-medium">{row.tied}</td>
                <td className="text-slate-500 font-medium">{row.lost}</td>

                <td className="text-slate-600 dark:text-slate-700 font-medium">
                  {row.gf}
                </td>
                <td className="text-slate-600 dark:text-slate-700 font-medium">
                  {row.gc}
                </td>
                <td
                  className={`font-bold ${row.dg > 0 ? "text-green-600" : row.dg < 0 ? "text-red-600" : "text-slate-500"}`}
                >
                  {row.dg > 0 ? `+${row.dg}` : row.dg}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
