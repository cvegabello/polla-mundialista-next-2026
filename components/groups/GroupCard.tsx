"use client";

import React, { useState, useEffect } from "react";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";

// --- TIPOS ---
export interface Team {
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
  home_team: Team;
  away_team: Team;
}

interface GroupDataReal {
  id: string;
  name: string;
  matches: MatchReal[];
}

interface GroupCardProps {
  group: GroupDataReal;
}

// Estructura para la tabla de posiciones
interface TableStats {
  team: string;
  pts: number;
  gf: number;
  gc: number;
  pos: number;
  isTied: boolean; // Para saber si activamos el combo box
}

export const GroupCard = ({ group }: GroupCardProps) => {
  // 1. ESTADO: Guardamos los partidos del grupo aquí para poder editarlos
  const [matches, setMatches] = useState<MatchReal[]>(group.matches);

  // 2. ESTADO: Datos calculados para la tabla
  const [tableData, setTableData] = useState<TableStats[]>([]);

  // --- FUNCIÓN: Calcular Tabla de Posiciones ---
  const calculateStandings = (currentMatches: MatchReal[]) => {
    const stats: Record<string, { pts: 0; gf: 0; gc: 0 }> = {};

    // A. Inicializar equipos en 0
    currentMatches.forEach((m) => {
      if (!stats[m.home_team.name_es])
        stats[m.home_team.name_es] = { pts: 0, gf: 0, gc: 0 };
      if (!stats[m.away_team.name_es])
        stats[m.away_team.name_es] = { pts: 0, gf: 0, gc: 0 };
    });

    // B. Calcular Puntos y Goles
    currentMatches.forEach((m) => {
      // Solo calculamos si el partido tiene marcador completo
      if (
        m.home_score !== null &&
        m.home_score !== undefined &&
        m.away_score !== null &&
        m.away_score !== undefined
      ) {
        const h = Number(m.home_score);
        const a = Number(m.away_score);
        const homeName = m.home_team.name_es;
        const awayName = m.away_team.name_es;

        // Goles
        stats[homeName].gf += h;
        stats[homeName].gc += a;
        stats[awayName].gf += a;
        stats[awayName].gc += h;

        // Puntos
        if (h > a) {
          stats[homeName].pts += 3;
        } else if (a > h) {
          stats[awayName].pts += 3;
        } else {
          stats[homeName].pts += 1;
          stats[awayName].pts += 1;
        }
      }
    });

    // C. Convertir a Array y Ordenar
    let sortedTeams = Object.entries(stats).map(([team, data]) => ({
      team,
      pts: data.pts,
      gf: data.gf,
      gc: data.gc,
      dg: data.gf - data.gc,
      pos: 0, // Se asigna después
      isTied: false,
    }));

    // ORDENAMIENTO FIFA: 1. Puntos, 2. DG, 3. GF
    sortedTeams.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts; // Mayor puntaje
      if (b.dg !== a.dg) return b.dg - a.dg; // Mayor diferencia gol
      return b.gf - a.gf; // Más goles a favor
    });

    // D. Asignar Posiciones y Detectar Empates Estrictos
    // Si dos equipos tienen igual Pts, DG y GF -> isTied = true
    const finalData = sortedTeams.map((item, index, array) => {
      let isTied = false;

      // Chequear empate con el anterior
      if (index > 0) {
        const prev = array[index - 1];
        if (
          prev.pts === item.pts &&
          prev.dg === item.dg &&
          prev.gf === item.gf
        ) {
          isTied = true;
          prev.isTied = true; // Marcar también al anterior
        }
      }

      return {
        ...item,
        pos: index + 1,
        isTied: isTied || item.isTied, // Mantiene true si ya fue marcado
      };
    });

    setTableData(finalData);
  };

  // --- EFECTO: Recalcular cuando cargue o cambien los partidos ---
  useEffect(() => {
    calculateStandings(matches);
  }, [matches]);

  // --- HANDLER: Cuando el usuario escribe en un input ---
  const handleScoreChange = (
    matchId: number,
    type: "home" | "away",
    value: string,
  ) => {
    const newVal = value === "" ? null : parseInt(value);

    setMatches((prev) =>
      prev.map((m) => {
        if (m.id === matchId) {
          return type === "home"
            ? { ...m, home_score: newVal }
            : { ...m, away_score: newVal };
        }
        return m;
      }),
    );
  };

  return (
    <div className="relative group w-full max-w-[350px] mx-auto transition-all duration-300">
      {/* GLOW */}
      <div className="absolute -inset-1 rounded-2xl blur-md transition duration-500 bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-orange-500 dark:to-white opacity-25 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-100"></div>

      {/* TARJETA */}
      <div className="relative bg-slate-900/90 text-white dark:bg-gradient-to-br dark:from-blue-50/95 dark:via-white/90 dark:to-blue-100/90 dark:text-slate-800 backdrop-blur-xl rounded-xl h-full flex flex-col justify-between overflow-hidden border border-cyan-500/30 dark:border-cyan-600/20 transition-all duration-300 ease-out hover:border-cyan-400 dark:hover:border-cyan-500 hover:ring-1 hover:ring-cyan-400 dark:hover:ring-cyan-500 hover:shadow-[0_0_15px_rgba(34,211,238,0.5)]">
        {/* Barra Neón */}
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

          {/* Partidos: Pasamos la función de cambio */}
          <div className="space-y-1 mb-4">
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                editable={true}
                onScoreChange={handleScoreChange} // ¡CONECTADO!
              />
            ))}
          </div>

          {/* Tabla: Le pasamos los DATOS CALCULADOS */}
          <GroupTable tableData={tableData} />
        </div>
      </div>
    </div>
  );
};
