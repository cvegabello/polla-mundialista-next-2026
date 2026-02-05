"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface TableRow {
  team: string;
  pos: number;
  pts: number;
  gf: number;
  gc: number;
  isTied: boolean;
}

interface GroupTableProps {
  // Ahora recibimos la data YA CALCULADA
  tableData: TableRow[];
}

export const GroupTable = ({ tableData }: GroupTableProps) => {
  // Estado local para manejar el orden visual (por si hay combos manuales)
  const [displayTeams, setDisplayTeams] = useState<TableRow[]>([]);

  // Cuando el padre manda nuevos datos (por un gol), actualizamos la tabla
  useEffect(() => {
    setDisplayTeams(tableData);
  }, [tableData]);

  // Lógica para CAMBIAR POSICIONES MANUALMENTE (Combos)
  const handlePositionChange = (currentTeamName: string, newPosStr: string) => {
    const newPos = parseInt(newPosStr);
    if (isNaN(newPos)) return;

    const updatedTeams = [...displayTeams];
    const currentTeamIndex = updatedTeams.findIndex(
      (t) => t.team === currentTeamName,
    );
    const targetTeamIndex = updatedTeams.findIndex((t) => t.pos === newPos);

    if (currentTeamIndex === -1 || targetTeamIndex === -1) return;

    // Solo permitimos cambio si ambos están marcados como empatados (seguridad opcional)
    // Pero lo dejaremos libre para que el usuario tenga el control final en los empates.

    // Intercambio de posiciones
    updatedTeams[targetTeamIndex].pos = updatedTeams[currentTeamIndex].pos;
    updatedTeams[currentTeamIndex].pos = newPos;

    // Reordenar visualmente
    updatedTeams.sort((a, b) => a.pos - b.pos);
    setDisplayTeams(updatedTeams);
  };

  return (
    <div className="mt-2 bg-slate-200/90 border-slate-300 dark:bg-slate-50/80 dark:border-slate-200/60 rounded-lg p-3 text-xs border shadow-sm overflow-hidden transition-all">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="text-cyan-600 dark:text-cyan-500 font-bold border-b border-slate-300/50 dark:border-slate-300/50 text-xs uppercase tracking-tighter">
            <th className="py-2 w-10">#</th>
            <th className="text-left pl-2">Equipo</th>
            <th className="w-8 text-yellow-600 dark:text-yellow-500 font-extrabold">
              PTS
            </th>
            <th className="w-8 text-cyan-600/70 dark:text-cyan-500/70">GF</th>
            <th className="w-8 text-cyan-600/70 dark:text-cyan-500/70">GC</th>
            <th className="w-8 text-cyan-600/70 dark:text-cyan-500/70">DG</th>
          </tr>
        </thead>
        <tbody className="relative">
          {displayTeams.map((row) => {
            const isTop2 = row.pos <= 2;

            return (
              <tr
                key={row.team}
                className={`border-b border-slate-300/50 dark:border-slate-300/50 last:border-0 transition-all duration-500 ease-in-out ${
                  isTop2
                    ? "bg-emerald-100/60 dark:bg-emerald-500/10"
                    : "hover:bg-white/40 dark:hover:bg-white/20"
                }`}
              >
                <td className="py-1.5 px-0.5 relative">
                  {/* SI HAY EMPATE (isTied), MOSTRAMOS EL COMBO */}
                  {row.isTied ? (
                    <div className="relative w-10 h-6 bg-slate-900 border border-slate-600 rounded flex items-center justify-center mx-auto overflow-hidden shadow-sm">
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
                    // SI NO HAY EMPATE, MOSTRAMOS EL NÚMERO FIJO
                    <span
                      className={`font-bold text-sm ${isTop2 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"}`}
                    >
                      {row.pos}
                    </span>
                  )}
                </td>

                <td
                  className={`text-left pl-2 font-bold truncate max-w-[90px] text-sm ${isTop2 ? "text-emerald-800 dark:text-emerald-400" : "text-slate-700 dark:text-slate-800"}`}
                >
                  {row.team}
                </td>

                <td className="font-extrabold text-yellow-600 dark:text-yellow-500 text-base">
                  {row.pts}
                </td>

                <td className="text-slate-600 dark:text-slate-700 font-medium text-sm">
                  {row.gf}
                </td>
                <td className="text-slate-600 dark:text-slate-700 font-medium text-sm">
                  {row.gc}
                </td>
                <td className="text-slate-500 dark:text-slate-600 text-sm">
                  {row.gf - row.gc}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
