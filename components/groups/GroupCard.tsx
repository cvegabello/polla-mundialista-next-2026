"use client";

import React, { useState } from "react";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";
import { GroupModal } from "./GroupModal"; // 👈 NUEVO: Importar el modal
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { GroupDataReal } from "@/types";
import { useGroupLogic } from "@/hooks/useGroupLogic";
import { saveGroupBulkPredictionsAction } from "@/lib/actions/fan-actions";
import { Maximize2 } from "lucide-react"; // 👈 NUEVO: Icono de ampliar

interface GroupCardProps {
  group: GroupDataReal;
  lang?: Language;
  initialPredictions?: any[];
  onPredictionChange: (matchId: string, isComplete: boolean) => void;
  isLocked?: boolean;
  // 👇 NUEVA PROPIEDAD PARA EL PUENTE
  onGroupDirty?: (groupId: string, matches: any[], tableData: any[]) => void;
}

export const GroupCard = ({
  group,
  lang = "es",
  initialPredictions = [],
  onPredictionChange,
  isLocked = false,
  onGroupDirty,
}: GroupCardProps) => {
  const t = DICTIONARY[lang];
  const [isModalOpen, setIsModalOpen] = useState(false); // 👈 NUEVO: Control del modal

  const {
    matches,
    tableData,
    userRole,
    isReady,
    handleScoreChange,
    handleManualSort,
    handleBulkUpdate, // 👈 Extraemos la función de guardado local (asegúrate de que esté en useGroupLogic)
  } = useGroupLogic(group, lang, initialPredictions, onGroupDirty);

  const hasUSA = matches.some(
    (m) => m.home_team?.flag_code === "usa" || m.away_team?.flag_code === "usa",
  );

  if (!isReady) {
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
    <>
      <div className="relative group w-full max-w-[350px] mx-auto transform-gpu will-change-transform">
        <div className="absolute -inset-1 rounded-2xl blur-md bg-gradient-to-r from-cyan-500 to-purple-600 dark:from-orange-500 dark:to-white opacity-25 group-hover:opacity-100 dark:opacity-0 dark:group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>

        <div className="relative bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-md rounded-xl h-full flex flex-col justify-between overflow-hidden border border-cyan-500/30 dark:border-cyan-600/20 shadow-lg z-10 transition-colors duration-300 hover:border-cyan-400 dark:hover:border-cyan-500">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#00c6ff] to-[#ff4b2b]"></div>

          <div className="p-4 flex flex-col h-full justify-between">
            {/* ENCABEZADO DE LA TARJETA */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 dark:border-slate-200/50 relative">
              {/* 👇 NUEVO: BOTÓN AMPLIAR ↗️ */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute right-0 top-0 p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-md transition-colors"
                title={lang === "en" ? "Expand Group" : "Ampliar Grupo"}
              >
                <Maximize2 size={18} />
              </button>

              <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 dark:from-blue-700 dark:to-purple-600 pr-8">
                  {lang === "en" ? "Group" : "Grupo"}{" "}
                  {group.name.replace("Grupo ", "").replace("Group ", "")}
                </h3>
                <span className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                  {group.id === "K"
                    ? t.colombiaGroup
                    : hasUSA
                      ? t.usaGroup
                      : t.phase}
                </span>
              </div>
            </div>

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

            <GroupTable
              tableData={tableData}
              lang={lang}
              onTableChange={handleManualSort}
            />
          </div>
        </div>
      </div>

      {/* 👇 NUEVO: RENDERIZADO DEL MODAL */}
      {isModalOpen && (
        <GroupModal
          group={group}
          currentMatches={matches}
          lang={lang}
          isLocked={isLocked}
          onClose={() => setIsModalOpen(false)}
          onSave={async (newMatches, newTable) => {
            // 1. Preparamos el paquete de los 6 partidos (null si los borraron)
            const bulkData = newMatches.map((m) => ({
              matchId: m.id,
              hScore: m.home_score ?? null,
              aScore: m.away_score ?? null,
            }));

            // 2. Extraemos el ID del usuario de forma segura para la BD
            const sessionStr = localStorage.getItem("polla_session");
            let userId = null;
            if (sessionStr) {
              const session = JSON.parse(sessionStr);
              // Validamos las formas más comunes en que guardas el ID en tu sesión
              userId = session?.id || session?.user?.id || session?.user_id;
            }

            // 3. Disparamos la Server Action
            if (userId) {
              await saveGroupBulkPredictionsAction(userId, bulkData);
            } else {
              console.warn(
                "⚠️ No se pudo guardar en BD: No se encontró el userId en la sesión.",
              );
            }

            // 4. Actualizamos la memoria visual de la tarjeta pequeña y cerramos
            if (handleBulkUpdate) {
              handleBulkUpdate(newMatches, newTable);
            }
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
};
