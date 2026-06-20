"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { TableStats } from "@/types";

interface GroupTableProps {
  tableData: TableStats[];
  lang?: Language;
  onTableChange?: (data: TableStats[]) => void;
  variant?: "compact" | "large";
  onManualTieBreaker?: (teamId: string, pos: number | null) => void;
  manualTieBreakers?: Record<string, number>;
}

export const GroupTable = ({
  tableData,
  lang = "es",
  onTableChange,
  variant = "compact",
  onManualTieBreaker,
  manualTieBreakers,
}: GroupTableProps) => {
  const t = DICTIONARY[lang];
  const [displayTeams, setDisplayTeams] = useState<TableStats[]>([]);
  const isLarge = variant === "large";

  useEffect(() => {
    setDisplayTeams(tableData);
  }, [tableData]);

  const handlePositionChange = (currentTeamName: string, newPosStr: string) => {
    const newPos = parseInt(newPosStr);
    if (isNaN(newPos)) return;
    const updatedTeams = [...displayTeams];
    const currentTeamIndex = updatedTeams.findIndex(
      (t) => t.team === currentTeamName,
    );
    const targetTeamIndex = updatedTeams.findIndex((t) => t.pos === newPos);

    if (currentTeamIndex !== -1 && targetTeamIndex !== -1) {
      const tempPos = updatedTeams[currentTeamIndex].pos;
      updatedTeams[currentTeamIndex].pos = updatedTeams[targetTeamIndex].pos;
      updatedTeams[targetTeamIndex].pos = tempPos;
      const finalSorted = [...updatedTeams].sort((a, b) => a.pos - b.pos);
      setDisplayTeams(finalSorted);
      if (onTableChange) onTableChange(finalSorted);
    }
  };

  // 🎨 DISEÑO PARA EL MODAL (Optimizado para no generar scroll)
  if (isLarge) {
    return (
      <div className="mt-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 shadow-xl max-w-4xl mx-auto backdrop-blur-md">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-cyan-400 font-bold text-[10px] uppercase tracking-widest border-b border-white/10">
              <th className="pb-2">Pos</th>
              <th className="text-left pb-2 pl-2">{t.team}</th>
              <th className="pb-2 text-yellow-500">{t.pts}</th>
              <th className="pb-2 text-slate-400 px-1">PJ</th>
              <th className="pb-2 text-slate-400 px-1">G</th>
              <th className="pb-2 text-slate-400 px-1">E</th>
              <th className="pb-2 text-slate-400 px-1">P</th>
              <th className="pb-2 text-cyan-500/60 px-1">GF</th>
              <th className="pb-2 text-cyan-500/60 px-1">GC</th>
              <th className="pb-2 text-cyan-500/60 px-1">DG</th>
            </tr>
          </thead>
          <tbody>
            {displayTeams.map((row) => {
              const isTop2 = row.pos <= 2;
              return (
                <tr
                  key={row.teamId}
                  className={`transition-colors border-b border-white/5 last:border-0 ${isTop2 ? "bg-cyan-500/5" : ""}`}
                >
                  <td className="py-2 text-sm font-black italic text-slate-500">
                    {row.pos}
                  </td>
                  <td className="text-left pl-2 py-2">
                    <span
                      className={`text-sm font-bold ${isTop2 ? "text-white" : "text-slate-300"}`}
                    >
                      {row.team}
                    </span>
                  </td>
                  <td className="text-base font-black text-yellow-500 py-2">
                    {row.pts}
                  </td>
                  <td className="text-slate-400 text-xs">{row.played}</td>
                  <td className="text-slate-400 text-xs">{row.won}</td>
                  <td className="text-slate-400 text-xs">{row.tied}</td>
                  <td className="text-slate-400 text-xs">{row.lost}</td>
                  <td className="text-slate-300 text-xs">{row.gf}</td>
                  <td className="text-slate-300 text-xs">{row.gc}</td>
                  <td
                    className={`text-xs font-bold ${row.dg > 0 ? "text-emerald-400" : row.dg < 0 ? "text-rose-500" : "text-slate-500"}`}
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
  }

  // 🏠 TABLA ORIGINAL DE LA TARJETA (INTACTA)
  return (
    <div className="mt-2 bg-slate-200/90 border-slate-300 dark:bg-slate-50/80 dark:border-slate-200/60 rounded-lg p-3 text-xs border shadow-sm overflow-hidden">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="py-2 text-cyan-600 dark:text-cyan-500 font-bold border-b border-slate-300/50 text-[10px] uppercase tracking-tighter">
            <th className="w-8">#</th>
            <th className="text-left pl-2">{t.team}</th>
            <th className="w-8 text-yellow-500 font-extrabold">{t.pts}</th>
            <th className="w-6 text-slate-500">J</th>
            <th className="w-6 text-slate-500">G</th>
            <th className="w-6 text-slate-500">E</th>
            <th className="w-6 text-slate-500">P</th>
            <th className="w-7 text-cyan-500/70">{t.gf}</th>
            <th className="w-7 text-cyan-500/70">{t.gc}</th>
            <th className="w-7 text-cyan-500/70">{t.dg}</th>
          </tr>
        </thead>
        <tbody>
          {displayTeams.map((row) => {
            const isTop2 = row.pos <= 2;
            const manualPos = manualTieBreakers?.[row.teamId];
            return (
              <tr
                key={row.teamId}
                className={`border-b border-slate-300/20 last:border-0 ${isTop2 ? "bg-emerald-500/10" : ""}`}
              >
                <td className="py-1.5 px-0.5 font-bold text-sm text-slate-500">
                  {onManualTieBreaker && row.isTied ? (
                    <select
                      value={manualPos || ""}
                      onChange={(e) =>
                        onManualTieBreaker(
                          row.teamId,
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className="bg-red-100 dark:bg-red-900/30 border border-red-500 text-red-600 dark:text-red-400 font-black rounded text-center w-full appearance-none cursor-pointer"
                    >
                      <option value="">-</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                    </select>
                  ) : (
                    row.pos
                  )}
                </td>
                <td className="text-left pl-2 font-bold truncate max-w-[85px] text-[11px] text-slate-700">
                  {row.team}
                </td>
                <td className="font-extrabold text-yellow-600 text-sm">
                  {row.pts}
                </td>
                <td className="text-slate-500 font-medium">{row.played}</td>
                <td className="text-slate-500 font-medium">{row.won}</td>
                <td className="text-slate-500 font-medium">{row.tied}</td>
                <td className="text-slate-500 font-medium">{row.lost}</td>
                <td className="text-slate-600 font-medium">{row.gf}</td>
                <td className="text-slate-600 font-medium">{row.gc}</td>
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
