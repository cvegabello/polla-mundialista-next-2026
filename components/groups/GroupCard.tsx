"use client";

import React, { useState } from "react";
import { MatchRow } from "./MatchRow";
import { GroupTable } from "./GroupTable";
import { GroupModal } from "./GroupModal";
import { DICTIONARY, Language } from "@/components/constants/dictionary";
import { GroupDataReal } from "@/types";
import { useGroupLogic } from "@/hooks/useGroupLogic";
import { saveGroupBulkPredictionsAction } from "@/lib/actions/fan-actions";
import { Maximize2 } from "lucide-react";

interface GroupCardProps {
  group: GroupDataReal;
  lang?: Language;
  initialPredictions?: any[];
  onPredictionChange: (matchId: string, isComplete: boolean) => void;
  isLocked?: boolean;
  onGroupDirty?: (groupId: string, matches: any[], tableData: any[]) => void;
  // 👇 NUEVO: Recibimos los bonos del grupo si ya se calcularon
  groupBonus?: { points_won: number; bonus_type: string } | null;
}

export const GroupCard = ({
  group,
  lang = "es",
  initialPredictions = [],
  onPredictionChange,
  isLocked = false,
  onGroupDirty,
  groupBonus, // 👈 Lo recibimos aquí
}: GroupCardProps) => {
  const t = DICTIONARY[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🧠 LA NUEVA BARRERA INTELIGENTE:
  // Si es la vista del Fan, le borramos los goles de la FIFA al grupo
  // ANTES de meterlo a la memoria, para que no salgan fantasmas.
  const isPredictionView = typeof onGroupDirty === "function";
  const cleanGroupForFan = isPredictionView
    ? {
        ...group,
        matches: group.matches.map((m: any) => ({
          ...m,
          home_score: null,
          away_score: null,
        })),
      }
    : group;

  const {
    matches,
    tableData,
    userRole,
    isReady,
    handleScoreChange,
    handleManualSort,
    handleBulkUpdate,
  } = useGroupLogic(cleanGroupForFan, lang, initialPredictions, onGroupDirty); // 👈 MAGIA: Pasamos el grupo limpio aquí

  // 👇 HELPER: Dibuja el banner según los puntos ganados
  const renderBonusBanner = (points: number) => {
    const isEn = lang === "en"; // Verificamos si el idioma actual es inglés

    if (points === 10) {
      return (
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 font-bold text-sm text-center py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-fade-in">
          {isEn ? "👑 GROUP KING +10 PTS" : "👑 REY DE GRUPO +10 PTS"}
        </div>
      );
    }
    if (points === 5) {
      return (
        <div className="bg-blue-500/20 border border-blue-500 text-blue-400 font-bold text-sm text-center py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-fade-in">
          {isEn ? "🔄 INVERSE QUALIFIERS +5 PTS" : "🔄 CLASIFICADOS INV +5 PTS"}
        </div>
      );
    }
    if (points === 2) {
      return (
        <div className="bg-emerald-500/20 border border-emerald-500 text-emerald-400 font-bold text-sm text-center py-2 px-4 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-fade-in">
          {isEn ? "🎯 1 HIT +2 PTS" : "🎯 1 ACIERTO +2 PTS"}
        </div>
      );
    }
    // Si tiene el registro pero ganó 0
    return (
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 font-bold text-sm text-center py-2 px-4 rounded-lg animate-fade-in">
        {isEn ? "❌ NO QUALIFIERS 0 PTS" : "❌ NINGÚN CLASIFICADO 0 PTS"}
      </div>
    );
  };

  if (!isReady)
    return (
      <div className="w-full h-[400px] animate-pulse bg-slate-900/20 rounded-xl"></div>
    );

  return (
    <>
      <div className="relative group w-full max-w-[350px] mx-auto transform-gpu">
        <div className="relative bg-slate-900/95 backdrop-blur-md rounded-xl flex flex-col overflow-hidden border border-cyan-500/30 shadow-lg z-10">
          <div className="h-1.5 w-full bg-linear-to-r from-[#00c6ff] to-[#ff4b2b]"></div>
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
              {matches.map((match) => {
                const originalOfficialMatch = group.matches.find(
                  (m) => m.id === match.id,
                );
                const userPrediction = initialPredictions.find(
                  (p) => p.match_id.toString() === match.id.toString(),
                );

                return (
                  <MatchRow
                    key={match.id}
                    match={match} // 👈 MAGIA: Volvemos a pasar el match limpio que reacciona al teclado
                    editable={!isLocked}
                    onScoreChange={handleScoreChange}
                    lang={lang}
                    onPredictionChange={onPredictionChange}
                    officialHomeScore={originalOfficialMatch?.home_score}
                    officialAwayScore={originalOfficialMatch?.away_score}
                    pointsWon={userPrediction?.points_won}
                  />
                );
              })}
            </div>

            <GroupTable
              tableData={tableData}
              lang={lang}
              onTableChange={handleManualSort}
            />

            {/* 👇 MAGIA: SI EXISTE EL BONO PARA ESTE GRUPO, MOSTRAMOS EL BANNER AL FINAL */}
            {groupBonus !== undefined && groupBonus !== null && (
              <div className="mt-4">
                {renderBonusBanner(groupBonus.points_won)}
              </div>
            )}
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
