"use client";

import React, { useState } from "react";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";
import { GroupModal } from "./GroupModal";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { GroupDataReal } from "@/types";
import { useGroupLogic } from "@/hooks/useGroupLogic";
import { saveGroupBulkPredictionsAction } from "@/lib/actions/fan-actions"; // Se usa SOLO en el modal
import { Maximize2 } from "lucide-react";

interface GroupCardProps {
  group: GroupDataReal;
  lang?: Language;
  initialPredictions?: any[];
  onPredictionChange: (matchId: string, isComplete: boolean) => void;
  isLocked?: boolean;
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    matches,
    tableData,
    userRole,
    isReady,
    handleScoreChange,
    handleManualSort,
    handleBulkUpdate,
  } = useGroupLogic(group, lang, initialPredictions, onGroupDirty);

  const hasUSA = matches.some(
    (m) => m.home_team?.flag_code === "usa" || m.away_team?.flag_code === "usa",
  );

  if (!isReady)
    return (
      <div className="w-full h-[400px] animate-pulse bg-slate-900/20 rounded-xl"></div>
    );

  return (
    <>
      <div className="relative group w-full max-w-[350px] mx-auto transform-gpu">
        <div className="relative bg-slate-900/95 backdrop-blur-md rounded-xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-lg z-10">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#00c6ff] to-[#ff4b2b]"></div>
          <div className="p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10 relative">
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute right-0 top-0 p-1.5 text-cyan-400 hover:text-white hover:bg-cyan-500/20 rounded-md"
              >
                <Maximize2 size={18} />
              </button>
              <div>
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  {lang === "en" ? "Group" : "Grupo"}{" "}
                  {group.name.replace("Grupo ", "").replace("Group ", "")}
                </h3>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              {matches.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  editable={!isLocked}
                  onScoreChange={handleScoreChange} // 👈 Solo actualiza estado local y activa bandera de salvar
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

      {isModalOpen && (
        <GroupModal
          group={group}
          currentMatches={matches}
          lang={lang}
          isLocked={isLocked}
          onClose={() => setIsModalOpen(false)}
          onSave={async (newMatches, newTable) => {
            // 1. EL MODAL SÍ SALVA A BASE DE DATOS (Como pediste)
            const bulkData = newMatches.map((m) => ({
              matchId: m.id,
              hScore: m.home_score ?? null,
              aScore: m.away_score ?? null,
            }));

            const sessionStr = localStorage.getItem("polla_session");
            if (sessionStr) {
              const session = JSON.parse(sessionStr);
              const userId =
                session?.id || session?.user?.id || session?.user_id;
              if (userId) {
                await saveGroupBulkPredictionsAction(userId, bulkData);
              }
            }

            // 2. Sincronizamos la tarjeta principal SIN activar el botón de salvar del encabezado
            // Para eso, NO llamamos a onGroupDirty aquí, solo actualizamos los datos visuales.
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
