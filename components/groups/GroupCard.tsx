"use client";

import React from "react";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { GroupDataReal } from "@/types";

// 👇 IMPORTAMOS EL NUEVO CEREBRO
import { useGroupLogic } from "@/hooks/useGroupLogic";

interface GroupCardProps {
  group: GroupDataReal;
  lang?: Language;
  initialPredictions?: any[];
  onPredictionChange: (matchId: string, isComplete: boolean) => void;
  isLocked?: boolean;
}

export const GroupCard = ({
  group,
  lang = "es",
  initialPredictions = [],
  onPredictionChange,
  isLocked = false,
}: GroupCardProps) => {
  const t = DICTIONARY[lang];

  // 👇 AQUÍ OCURRE LA MAGIA: Extraemos también handleManualSort
  const {
    matches,
    tableData,
    saveStatus,
    userRole,
    isReady,
    handleScoreChange,
    handleManualSort, // 👈 NUEVO: El encargado de guardar el desempate manual
  } = useGroupLogic(group, lang, initialPredictions);

  // Revisamos si en los partidos de este grupo juega USA
  const hasUSA = matches.some(
    (m) => m.home_team.flag_code === "usa" || m.away_team.flag_code === "usa",
  );

  // --- RENDERIZADO ---

  if (!isReady) {
    // Skeleton de carga rápido
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-slate-900/20 rounded-xl border border-white/5 animate-pulse"></div>
    );
  }

  if (userRole === "ADMIN_GRUPO") {
    return (
      <div className="w-full p-6 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-white/10 mt-4 backdrop-blur-md">
        <h2 className="text-xl font-bold text-gray-300">Vista de Admin</h2>
        <p className="text-sm text-gray-500 mt-2">
          Gestiona este grupo desde el panel principal.
        </p>
      </div>
    );
  }

  return (
    <div className="relative group w-full max-w-[350px] mx-auto transform-gpu will-change-transform">
      {/* GLOW DE FONDO */}
      <div className="absolute -inset-1 rounded-2xl blur-md bg-linear-to-r from-cyan-500 to-purple-600 dark:from-orange-500 dark:to-white opacity-25 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

      {/* TARJETA PRINCIPAL */}
      <div className="relative bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-md rounded-xl h-full flex flex-col justify-between overflow-hidden border border-cyan-500/30 dark:border-cyan-600/20 shadow-lg z-10 transition-colors duration-300 hover:border-cyan-400 dark:hover:border-cyan-500">
        {/* BARRA SUPERIOR */}
        <div className="h-1.5 w-full bg-linear-to-r from-[#00c6ff] to-[#ff4b2b]"></div>

        <div className="p-4 flex flex-col h-full justify-between">
          {/* ENCABEZADO */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 dark:border-slate-200/50">
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-400 dark:from-blue-700 dark:to-purple-600">
                {lang === "en" ? "Group" : "Grupo"}{" "}
                {group.name.replace("Grupo ", "").replace("Group ", "")}
              </h3>
              <span
                className={`text-[10px] font-medium transition-colors duration-300 ${saveStatus === "saving" ? "text-yellow-400 animate-pulse" : saveStatus === "saved" ? "text-green-400" : saveStatus === "error" ? "text-red-500" : "text-transparent"}`}
              >
                {saveStatus === "saving"
                  ? t.saving
                  : saveStatus === "saved"
                    ? t.saved
                    : saveStatus === "error"
                      ? t.error
                      : "."}
              </span>
            </div>

            <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider font-bold">
              {group.id === "K"
                ? t.colombiaGroup
                : hasUSA
                  ? t.usaGroup
                  : t.phase}
            </span>
          </div>

          {/* LISTA DE PARTIDOS */}
          <div className="space-y-1 mb-4">
            {matches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                editable={!isLocked}
                onScoreChange={handleScoreChange}
                lang={lang}
                onPredictionChange={onPredictionChange}
              />
            ))}
          </div>

          {/* TABLA DE POSICIONES */}
          <GroupTable
            tableData={tableData}
            lang={lang}
            onTableChange={handleManualSort} // 👈 CONECTAMOS EL DESEMPATE MANUAL
          />
        </div>
      </div>
    </div>
  );
};
